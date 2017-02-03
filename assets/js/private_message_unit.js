// Start a private conversation with another unit
function startPrivateUnitConversation() {

  // Get the unit list
  var select = $('#units-list');

  // Make sure a unit is selected in the list
  if (select.val() === null) {
    return alert('Please select a unit to send a private message to.');
  }

  // Get the recipient's name from the text of the option in the <select>
  var recipientName = $('option:selected', select).text();
  var recipientId = select.val();
  console.log(recipientId);
  // Prompt for a message to send
  var message = prompt("Enter a message to send to "+recipientName);

  // Create the UI for the channel if it doesn't exist
  createPrivateConversationChannelUnit({name:recipientName, id:recipientId});

  // Add the message to the channel
  addMessageToConversationUnit(window.me.id, recipientId, message);

  // Send the private message
  io.socket.post('/emergency/privateunit', {to:recipientId, msg: message});

}

// Create the HTML to hold a private conversation between two units
function createPrivateConversationChannelUnit(penPal) {

  // Get the ID of the HTML element for this private convo, if there is one
  var channelName = 'private-channel-unit-'+penPal.id;

  // If HTML for the channel already exists, return.
  if ($('#'+channelName).length) {
    return;
  }

  var penPalName = penPal.name == "unknown" ? ("Unit #"+penPal.id) : penPal.name;

  // Create a new div to contain the channel
  var channelDiv = $('<div id="'+channelName+'"></div>');

  // Create the HTML for the channel
  var channelHTML = '<h2>Private conversation with <span id="private-unitname-'+penPal.id+'">'+penPalName+'</span></h2>\n' +
                 '<div id="private-messages-unit-'+penPal.id+'" style="width: 50%; height: 150px; overflow: auto; border: solid 1px #666; padding: 5px; margin: 5px"></div>'+
                 '<input id="private-message-unit-'+penPal.id+'"/> <button id="private-button-unit-'+penPal.id+'">Send message</button">';

  channelDiv.html(channelHTML);

  // Add the channel to the private conversation area
  $('#convos-unit').append(channelDiv);

  // Hook up the "send message" button
  $('#private-button-unit-'+penPal.id).click(onClickSendPrivateMessageUnit);

}

// Callback for when the unit clicks the "Send message" button in a private conversation
function onClickSendPrivateMessageUnit(e) {

  // Get the button that was pressed
  var button = e.currentTarget;

  // Get the ID of the unit we want to send to
  var split_button_name = button.id.split('-');
  var recipientId = split_button_name[split_button_name.length-1];

  // Get the message to send
  var message = $('#private-message-unit-'+recipientId).val();
  $('#private-message-unit-'+recipientId).val("");

  // Add this message to the channel
  addMessageToConversationUnit(window.me.id, recipientId, message);

  // Send the message
  io.socket.post('/emergency/privateunit', {to: recipientId, msg: message});

}

// Add HTML for a new message in a private conversation
function addMessageToConversationUnit(senderId, recipientId, message) {

  var fromMe = senderId == window.me.id;
  var channelName = 'private-messages-unit-' + (fromMe ? recipientId : senderId);
  var senderName = fromMe ? "Me" : $('#private-unitname-'+senderId).html();
  var justify = fromMe ? 'right' : 'left';

  var div = $('<div style="text-align:'+justify+'"></div>');
  div.html('<strong>'+senderName+'</strong>: '+message);
  $('#'+channelName).append(div);

}

// Handle an incoming private message from the server.
function receivePrivateMessageUnit(data) {

  var sender = data.from;

  // Create a channel for this message if one doesn't exist
  createPrivateConversationChannelUnit(sender);

  // Add a message to the channel
  addMessageToConversationUnit(sender.id, window.me.id, data.msg);

}
