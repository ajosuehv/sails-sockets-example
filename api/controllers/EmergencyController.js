/**
 * EmergencyController
 *
 * @description :: Server-side logic for managing emergencies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  // Send a private message from one unit to another
  privateuser: function (req, res) {
    // Get the ID of the currently connected socket
    var socketId = sails.sockets.getId(req.socket);
    // Use that ID to look up the user in the session
    // We need to do this because we can have more than one user
    // per session, since we're creating one user per socket
    var user = req.session.users[socketId];
    if (user) {
      User.findOne(req.session.users[socketId].id).exec(function (err, sender) {
        // Publish a message to that user's "channel".  In our app, the only subscriber to that
        // channel will be the socket that the user is on (subscription occurs in the onConnect
        // method of config/sockets.js), so only they will get this message.
        User.message(req.param('to'), {
          from: sender,
          msg: req.param('msg')
        });
        Unit.message(req.param('to'), {
          from: sender,
          msg: req.param('msg')
        });

      });
    } else {
      Unit.findOne(req.session.units[socketId].id).exec(function (err, sender) {
        // Publish a message to that unit's "channel".  In our app, the only subscriber to that
        // channel will be the socket that the unit is on (subscription occurs in the onConnect
        // method of config/sockets.js), so only they will get this message.
        User.message(req.param('to'), {
          from: sender,
          msg: req.param('msg')
        });
      });
    }


  },

  // Post a message in a public chat channel
  publicuser: function (req, res) {
    // Get the ID of the currently connected socket
    var socketId = sails.sockets.getId(req.socket);
    // Use that ID to look up the user in the session
    // We need to do this because we can have more than one user
    // per session, since we're creating one user per socket
    var user = req.session.users[socketId];
    if (user){
      User.findOne(req.session.users[socketId].id).exec(function (err, user) {
        // Publish a message to the channel's "channel".  Every unit in the channel will have their socket
        // subscribed to it, so they'll all get the message.  The unit who created the channel gets
        // their socket subscribed to it in ChannelController.create; everyone who joins later gets
        // subscribed in ChannelController.join.
        Channel.message(req.param('channel'), {
          channel: {
            id: req.param('channel')
          },
          from: user,
          msg: req.param('msg')
        }, req.socket);

      });
    } else{
      Unit.findOne(req.session.units[socketId].id).exec(function (err, unit) {
        // Publish a message to the channel's "channel".  Every unit in the channel will have their socket
        // subscribed to it, so they'll all get the message.  The unit who created the channel gets
        // their socket subscribed to it in ChannelController.create; everyone who joins later gets
        // subscribed in ChannelController.join.
        Channel.message(req.param('channel'), {
          channel: {
            id: req.param('channel')
          },
          from: unit,
          msg: req.param('msg')
        }, req.socket);

      });
    }


  },
  // Send a private message from one unit to another
  privateunit: function (req, res) {
    // Get the ID of the currently connected socket
    var socketId = sails.sockets.getId(req.socket);
    console.log("privateunit");
    console.log(req.param('to'));
    // Use that ID to look up the unit in the session
    // We need to do this because we can have more than one unit
    // per session, since we're creating one unit per socket
    Unit.findOne(req.session.units[socketId].id).exec(function (err, sender) {
      // Publish a message to that unit's "channel".  In our app, the only subscriber to that
      // channel will be the socket that the unit is on (subscription occurs in the onConnect
      // method of config/sockets.js), so only they will get this message.
      Unit.message(req.param('to'), {
        from: sender,
        msg: req.param('msg')
      });

    });

  },

  // Post a message in a public chat channel
  publicunit: function (req, res) {
    console.log("publicunit");
    // Get the ID of the currently connected socket
    var socketId = sails.sockets.getId(req.socket);
    // Use that ID to look up the unit in the session
    // We need to do this because we can have more than one unit
    // per session, since we're creating one unit per socket
    Unit.findOne(req.session.units[socketId].id).exec(function (err, unit) {
      // Publish a message to the channel's "channel".  Every unit in the channel will have their socket
      // subscribed to it, so they'll all get the message.  The unit who created the channel gets
      // their socket subscribed to it in ChannelController.create; everyone who joins later gets
      // subscribed in ChannelController.join.
      Channel.message(req.param('channel'), {
        channel: {
          id: req.param('channel')
        },
        from: unit,
        msg: req.param('msg')
      }, req.socket);

    });

  }
};
