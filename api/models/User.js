/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  autosubscribe: ['destroy', 'update'],
  attributes: {
    name: 'string',
    channels: {
      collection: 'channel',
      via: 'users',
      dominant: true
    }
  },
  afterPublishUpdate: function(id, changes, req, options) {
    User.findOne(id).populate('channels').exec(function(err, user) {
      sails.util.each(user.channels, function(channel) {
        var previousName = options.previous.name == 'unknown' ? 'User #' + id : options.previous.name;
        Channel.message(channel.id, {
          channel: {
            id: channel.id
          },
          from: {
            id: 0
          },
          msg: previousName + " changed their name to " + changes.name
        }, req);
      });
    });
  }
};
