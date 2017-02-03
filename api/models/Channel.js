/**
 * Channel.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  autosubscribe: ['destroy', 'update', 'add:users', 'remove:users',
  'add:units', 'delete:units'
  ],
  attributes: {
    name: 'string',
    units: {
      collection: 'unit',
      via: 'channels'
    },
    users: {
      collection: 'user',
      via: 'channels'
    }
  },
  afterPublishRemove: function(id, alias, idRemoved, req) {
    if (alias == 'units') {
      Channel.findOne(id).populate('units').populate('users').exec(function (err, channel) {
        if (channel.units.length === 0 && channel.users.length  ) {
          console.log(channel.users.length);
          console.log(channel.units.length);
          channel.destroy(function (err) {
            Channel.publishDestroy(channel.id);
          });
        }
      });
    } else {
      Channel.findOne(id).populate('users').populate('users').exec(function (err, channel) {
        if (channel.units.length === 0 && channel.users.length === 0) {
          console.log(channel.users.length);
          console.log(channel.units.length);

          channel.destroy(function (err) {
            Channel.publishDestroy(channel.id);
          });
        }
      });
    }
  }
};
