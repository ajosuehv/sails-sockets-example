 /**
  * UnitController
  *
  * @description :: Server-side logic for managing units
  * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
  */

  module.exports = {

    // Create a new unit and tell the world about them.
    // This will be called every time a socket connects, so that each socket
    // represents one unit--this is so that it's easy to demonstrate inter-unit
    // communication by opening a bunch of tabs or windows.  In the real world,
    // you'd want multiple tabs to represent the same logged-in unit.
    announce: function(req, res) {

      // Get the socket ID from the reauest
      var socketId = sails.sockets.getId(req);

      // Get the session from the request
      var session = req.session;

      // Create the session.units hash if it doesn't exist already
      session.units = session.units || {};
			session.users = session.users || {};

      Unit.create({
        name: 'unknown',
        socketId: socketId
      }).exec(function(err, unit) {
        if (err) {
          return res.serverError(err);
        }

        // Save this unit in the session, indexed by their socket ID.
        // This way we can look the unit up by socket ID later.
        session.units[socketId] = unit;

        // Subscribe the connected socket to custom messages regarding the unit.
        // While any socket subscribed to the unit will receive messages about the
        // unit changing their name or being destroyed, ONLY this particular socket
        // will receive "message" events.  This allows us to send private messages
        // between units.
        Unit.subscribe(req, unit, 'message');

        // Get updates about units being created
        Unit.watch(req);

        // Get updates about channels being created
        Channel.watch(req);

        // Publish this unit creation event to every socket watching the Unit model via Unit.watch()
        Unit.publishCreate(unit, req);

        res.json(unit);

      });


    }

  };
