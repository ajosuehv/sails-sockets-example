// Add a new channel to the list
function newChannel() {

  // Prompt the user for the name of the new channel
  var channelName = prompt('Please enter a name for the new channel');

  // As long as a name is entered, create the new channel.
  if (channelName) {
    io.socket.post('/channel', {name: channelName}, function(data) {

      // Add the new channel to the channels list
      addChannel(data);

      // Select it in the list
      $('#channels-list').val(data.id);

      // Create the channel HTML
      createPublicChannel({id:data.id, name:data.name});

      // Join the channel
      io.socket.post('/channel/'+data.id+'/users', {id: window.me.id});

      // Set the channel user count to 1
      increaseChannelCount(data.id);

    });
  }

}

// Add a channel to the list of available channels to join--this can happen
// via newChannel (if the user created the channel themself) or after a notification
// from the server that another user added a channel.
function addChannel(channel) {

  // Get a handle to the channel list <select> element
  var select = $('#channels-list');

  // Create a new <option> for the <select> with the new channel's information
  var users = channel.users || [];
  var numUsers = users.length;

  var option = $('<option id="'+"channel-"+channel.id+'" data-name="'+channel.name+'" data-users="'+numUsers+'" value="'+channel.id+'">'+channel.name+' ('+numUsers+')</option>');

  // Add the new <option> element
  select.append(option);
}

// Increase the "number of users in channel" indicator label for a channel
function increaseChannelCount(channelId) {
  var channel = $('#channel-'+channelId);
  var numUsers = parseInt(channel.attr('data-users'), 10);
  numUsers++;
  channel.attr('data-users', numUsers);
  channel.html(channel.attr('data-name')+' ('+numUsers+')');
}

// Decrease the "number of users in channel" indicator label for a channel
function decreaseChannelCount(channelId) {
  var channel = $('#channel-'+channelId);
  var numUsers = parseInt(channel.attr('data-users'), 10);
  numUsers--;
  channel.attr('data-users', numUsers);
  channel.html(channel.attr('data-name')+' ('+numUsers+')');
}

// Remove a user from the list of available channels to join, by sending
// either a channel object or a channel ID.
function removeChannel(channel) {

  // Get the channel's ID
  var id = channel.id || channel;
  $('#channel-'+id).remove();
}

// Add multiple channels to the channels list.
function updateChannelList(channels) {
  channels.forEach(function(channel) {
    addChannel(channel);
  });
}
