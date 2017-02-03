// Start a private conversation with another user
function startPrivateConversation() {

  // Get the user list
  var select = $('#users-list');

  // Make sure a user is selected in the list
  if (select.val() === null) {
    return alert('Please select a user to send a private message to.');
  }

  // Get the recipient's name from the text of the option in the <select>
  var recipientName = $('option:selected', select).text();
  var recipientId = select.val();

  // Prompt for a message to send
  var message = prompt("Enter a message to send to "+recipientName);

  // Create the UI for the channel if it doesn't exist
  createPrivateConversationChannel({name:recipientName, id:recipientId});

  // Add the message to the channel
  addMessageToConversation(window.me.id, recipientId, message);

  // Send the private message
  io.socket.post('/emergency/privateuser', {to:recipientId, msg: message});

}

// Create the HTML to hold a private conversation between two users
function createPrivateConversationChannel(penPal) {

  // Get the ID of the HTML element for this private convo, if there is one
  var channelName = 'private-channel-'+penPal.id;

  // If HTML for the channel already exists, return.
  if ($('#'+channelName).length) {
    return;
  }

  var penPalName = penPal.name == "unknown" ? ("User #"+penPal.id) : penPal.name;

  // Create a new div to contain the channel
  var channelDiv = $('<div id="'+channelName+'"></div>');

  // Create the HTML for the channel
  var channelHTML = '<h2>Private conversation with <span id="private-username-'+penPal.id+'">'+penPalName+'</span></h2>\n' +
                 '<div id="private-messages-'+penPal.id+'" style="width: 50%; height: 150px; overflow: auto; border: solid 1px #666; padding: 5px; margin: 5px"></div>'+
                 '<input id="private-message-'+penPal.id+'"/> <button id="private-button-'+penPal.id+'">Send message</button">';

  channelDiv.html(channelHTML);

  // Add the channel to the private conversation area
  $('#convos').append(channelDiv);

  // Hook up the "send message" button
  $('#private-button-'+penPal.id).click(onClickSendPrivateMessage);

}

// Callback for when the user clicks the "Send message" button in a private conversation
function onClickSendPrivateMessage(e) {

  // Get the button that was pressed
  var button = e.currentTarget;

  // Get the ID of the user we want to send to
  var recipientId = button.id.split('-')[2];
  console.log(recipientId);
  // Get the message to send
  var message = $('#private-message-'+recipientId).val();
  $('#private-message-'+recipientId).val("");

  // Add this message to the channel
  addMessageToConversation(window.me.id, recipientId, message);

  // Send the message
  io.socket.post('/emergency/privateuser', {to: recipientId, msg: message});

}

// Add HTML for a new message in a private conversation
function addMessageToConversation(senderId, recipientId, message) {

  var fromMe = senderId == window.me.id;
  var channelName = 'private-messages-' + (fromMe ? recipientId : senderId);
  var senderName = fromMe ? "Me" : $('#private-username-'+senderId).html();
  var justify = fromMe ? 'right' : 'left';

  var div = $('<div style="text-align:'+justify+'"></div>');
  div.html('<strong>'+senderName+'</strong>: '+message);
  $('#'+channelName).append(div);

}

// Handle an incoming private message from the server.
function receivePrivateMessage(data) {

  var sender = data.from;

  // Create a channel for this message if one doesn't exist
  createPrivateConversationChannel(sender);

  // Add a message to the channel
  addMessageToConversation(sender.id, window.me.id, data.msg);

}
