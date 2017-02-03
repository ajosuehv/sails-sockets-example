// Create the HTML to hold a public, multi-unit chat channel
function createPublicChannel(channel) {

  // Get the ID of the HTML element for this public channel, if there is one
  var channelName = 'public-channel-'+channel.id;

  // If HTML for the channel already exists, return.
  if ($('#'+channelName).length) {
    return;
  }

  // Create a new div to contain the channel
  var channelDiv = $('<div id="'+channelName+'"></div>');

  // Create the HTML for the channel
  var channelHTML = '<h2>Chat channel &ldquo;'+channel.name+'&rdquo; <button id="leave-channel-button-'+channel.id+'">Leave Channel</button></h2>\n' +
                 '<div id="channel-messages-'+channel.id+'" style="width: 50%; height: 150px; overflow: auto; border: solid 1px #666; padding: 5px; margin: 5px"></div>'+
                 '<input id="channel-message-'+channel.id+'"/> <button id="channel-button-'+channel.id+'">Send message</button">';

  channelDiv.html(channelHTML);

  // Add the channel to the private conversation area
  $('#channels').append(channelDiv);

  // Hook up the "send message" button
  $('#channel-button-'+channel.id).click(onClickSendPublicMessageUnit);

  // Hook up the "leave channel" button
  $('#leave-channel-button-'+channel.id).click(onClickLeaveChannelUnit);

}

// Callback for when the unit clicks the "Send message" button in a public channel
function onClickSendPublicMessageUnit(e) {

  // Get the button that was pressed
  var button = e.currentTarget;

  // Get the ID of the unit we want to send to
  var channelId = button.id.split('-')[2];

  // Get the message to send
  var message = $('#channel-message-'+channelId).val();
  $('#channel-message-'+channelId).val("");

  // Add this message to the channel
  addMessageToChatChannel(window.me.id, channelId, message);

  // Send the message
  io.socket.post('/emergency/publicunit', {channel: channelId, msg: message});

}

// Add HTML for a new message in a public channel
function addMessageToChatChannel(senderId, channelId, message) {

  var channelName = 'channel-messages-' + channelId;

  if (senderId === 0) {
    return postStatusMessage(channelName, message);
  }

  var fromMe = senderId == window.me.id;
  var senderName = fromMe ? "Me" : $('#unit-'+senderId).text();
  var justify = fromMe ? 'right' : 'left';

  var div = $('<div style="text-align:'+justify+'"></div>');
  div.html('<strong>'+senderName+'</strong>: '+message);
  $('#'+channelName).append(div);

}

// Handle an incoming public message from the server.
function receiveChannelMessage(data) {

  var sender = data.from;
  var channel = data.channel;

  // Create a channel for this message if one doesn't exist
  createPublicChannel(channel);

  // Add a message to the channel
  addMessageToChatChannel(sender.id, channel.id, data.msg);

}

// Join the channel currently selected in the list
function joinChannel() {

  // Get the channel list
  var select = $('#channels-list');

  // Make sure a channel is selected in the list
  if (select.val() === null) {
    return alert('Please select a channel to join.');
  }

  // Get the channel's name from the text of the option in the <select>
  var channelName = $('option:selected', select).attr('data-name');
  var channelId = select.val();

  // Create the channel HTML
  createPublicChannel({id:channelId, name:channelName});

  // Join the channel
  io.socket.post('/channel/'+channelId+'/units', {id: window.me.id});

  // Update the channel unit count
  increaseChannelCount(channelId);

}

// Handle the unit clicking the "Leave Channel" button for a public channel
function onClickLeaveChannelUnit(e) {

  // Get the button that was pressed
  var button = e.currentTarget;

  // Get the ID of the unit we want to send to
  var channelId = button.id.split('-')[3];

  // Remove the channel from the page
  $('#public-channel-'+channelId).remove();

  // Call the server to leave the channel
  io.socket.delete('/channel/'+channelId+'/units', {id: window.me.id});

  // Update the channel unit count
  decreaseChannelCount(channelId);

}
