/**
 * app.js
 *
 * Front-end code and event handling for sailsChat
 *
 */
$( document ).ready(load_user());

function load_user() {

// Attach a listener which fires when a connection is established:
  io.socket.on('connect', function socketConnected() {

    // Show the main UI
    $('#disconnect').hide();
    $('#main').show();

    // Announce that a new user is online--in this somewhat contrived example,
    // this also causes the CREATION of the user, so each window/tab is a new user.
    io.socket.get("/user/announce", function (data) {
      window.me = data;
      updateMyName(data);

      // Get the current list of users online.  This will also subscribe us to
      // update and destroy events for the individual users.
      io.socket.get('/user', updateUserList);

      // Get the current list of chat channels. This will also subscribe us to
      // update and destroy events for the individual channels.
      io.socket.get('/channel', updateChannelList);

    });

    // Listen for the "channel" event, which will be broadcast when something
    // happens to a channel we're subscribed to.  See the "autosubscribe" attribute
    // of the Channel model to see which messages will be broadcast by default
    // to subscribed sockets.
    io.socket.on('channel', function messageReceived(message) {

      switch (message.verb) {

        // Handle channel creation
        case 'created':
          addChannel(message.data);
          break;

        // Handle a user joining a channel
        case 'addedTo':
          // Post a message in the channel
          postStatusMessage('channel-messages-' + message.id, $('#user-' + message.addedId).text() + ' has joined');
          // Update the channel user count
          increaseChannelCount(message.id);
          break;

        // Handle a user leaving a channel
        case 'removedFrom':
          // Post a message in the channel
          postStatusMessage('channel-messages-' + message.id, $('#user-' + message.removedId).text() + ' has left');
          // Update the channel user count
          decreaseChannelCount(message.id);
          break;

        // Handle a channel being destroyed
        case 'destroyed':
          removeChannel(message.id);
          break;

        // Handle a public message in a channel.  Only sockets subscribed to the "message" context of a
        // Channel instance will get this message--see the "join" and "leave" methods of ChannelController.js
        // to see where a socket gets subscribed to a Channel instance's "message" context.
        case 'messaged':
          receiveChannelMessage(message.data);
          break;

        default:
          break;

      }

    });

    // Listen for the "user" event, which will be broadcast when something
    // happens to a user we're subscribed to.  See the "autosubscribe" attribute
    // of the User model to see which messages will be broadcast by default
    // to subscribed sockets.
    io.socket.on('user', function messageReceived(message) {

      switch (message.verb) {

        // Handle user creation
        case 'created':
          addUser(message.data);
          break;

        // Handle a user changing their name
        case 'updated':

          // Get the user's old name by finding the <option> in the list with their ID
          // and getting its text.
          var oldName = $('#user-' + message.id).text();

          // Update the name in the user select list
          $('#user-' + message.id).text(message.data.name);

          // If we have a private convo with them, update the name there and post a status message in the chat.
          if ($('#private-username-' + message.id).length) {
            $('#private-username-' + message.id).html(message.data.name);
            postStatusMessage('private-messages-' + message.id, oldName + ' has changed their name to ' + message.data.name);
          }

          break;

        // Handle user destruction
        case 'destroyed':
          removeUser(message.id);
          break;

        // Handle private messages.  Only sockets subscribed to the "message" context of a
        // User instance will get this message--see the onConnect logic in config/sockets.js
        // to see where a new user gets subscribed to their own "message" context
        case 'messaged':
          receivePrivateMessage(message.data);
          break;

        default:
          break;
      }

    });
    io.socket.on('unit', function messageReceived(message) {

      switch (message.verb) {

        // Handle unit creation
        case 'created':
          addUnit(message.data);
          break;

        // Handle a unit changing their name
        case 'updated':

          // Get the unit's old name by finding the <option> in the list with their ID
          // and getting its text.
          var oldName = $('#unit-' + message.id).text();

          // Update the name in the unit select list
          $('#unit-' + message.id).text(message.data.name);

          // If we have a private convo with them, update the name there and post a status message in the chat.
          if ($('#private-unitname-' + message.id).length) {
            $('#private-unitname-' + message.id).html(message.data.name);
            postStatusMessage('private-messages-' + message.id, oldName + ' has changed their name to ' + message.data.name);
          }

          break;

        // Handle unit destruction
        case 'destroyed':
          removeUnit(message.id);
          break;

        // Handle private messages.  Only sockets subscribed to the "message" context of a
        // Unit instance will get this message--see the onConnect logic in config/sockets.js
        // to see where a new unit gets subscribed to their own "message" context
        case 'messaged':
          receivePrivateMessageUnit(message.data);
          break;

        default:
          break;
      }

    });

    // Add a click handler for the "Update name" button, allowing the user to update their name.
    // updateName() is defined in user.js.
    $('#update-name').click(updateName);

    // Add a click handler for the "Send private message" button
    // startPrivateConversation() is defined in private_message.js.
    $('#private-msg-button').click(startPrivateConversation);

    // Add a click handler for the "Join channel" button
    // joinChannel() is defined in public_message.js.
    $('#join-channel').click(joinChannel);

    // Add a click handler for the "New channel" button
    // newChannel() is defined in channel.js.
    $('#new-channel').click(newChannel);

    console.log('Socket is now connected!');

    // When the socket disconnects, hide the UI until we reconnect.
    io.socket.on('disconnect', function () {
      // Hide the main UI
      $('#main').hide();
      $('#disconnect').show();
    });

  });
}

