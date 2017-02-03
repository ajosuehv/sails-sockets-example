// Update the value in the unit name input.
function updateMyNameUnit(me) {
  $('#my-name-unit').val(me.name == 'unknown' ? 'Unit #' + me.id : me.name);
}

// Update the current unit's unitname
function updateNameUnit() {
  // Use the Sails blueprint action to update the unit
  io.socket.put('/unit/'+window.me.id, {name: $('#my-name-unit').val()});
}

// Add a unit to the list of available units to chat with
function addUnit(unit) {

  // Get a handle to the unit list <select> element
  var select = $('#units-list');

  // Create a new <option> for the <select> with the new unit's information
  var option = $('<option id="'+"unit-"+unit.id+'" value="'+unit.id+'">'+(unit.name == "unknown" ? "Unit #" + unit.id : unit.name)+'</option>');

  // Add the new <option> element
  select.append(option);
}

// Remove a unit from the list of available units to chat with, by sending
// either a unit object or a unit ID.
function removeUnit(unit) {

  // Get the unit's ID.
  var id = unit.id || unit;

  var unitName = $('#unit-'+id).text();

  // Remove the corresponding element from the units list
  var unitEl = $('#unit-'+id).remove();

  // Re-append it to the body as a hidden element, so we can still
  // get the unit's name if we need it for other messages.
  // A silly hack for a silly app.
  unitEl.css('display', 'none');
  $('body').append(unitEl);

  // Post a unit status message if we're in a private convo
  if ($('#private-channel-unit-'+id).length) {
    postStatusMessage('private-messages-'+id, unitName + ' has disconnected.');
    $('#private-message-'+id).remove();
    $('#private-button-'+id).remove();
  }

}

// Add multiple units to the units list.
function updateUnitList(units) {
  units.forEach(function(unit) {
    if (unit.id == me.id) {return;}
    addUnit(unit);
  });
}

// Add a user to the list of available users to chat with
function addUser(user) {

  // Get a handle to the user list <select> element
  var select = $('#users-list');

  // Create a new <option> for the <select> with the new user's information
  var option = $('<option id="'+"user-"+user.id+'" value="'+user.id+'">'+(user.name == "unknown" ? "User #" + user.id : user.name)+'</option>');

  // Add the new <option> element
  select.append(option);
}

// Remove a user from the list of available users to chat with, by sending
// either a user object o
// Add multiple users to the users list.
function updateUserList(users) {
  users.forEach(function(user) {
    addUser(user);
  });
}
