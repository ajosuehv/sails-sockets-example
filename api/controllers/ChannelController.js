/**
 * ChannelController
 *
 * @description :: Server-side logic for managing channels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

  'userjoin': function(req, res, next) {
    var channelId = req.param('channelId');
    Channel.subscribe(req, channelId, ['message']);
    return next();
  },

  'userleave': function(req, res, next) {
    var channelId = req.param('channelId');
    Channel.unsubscribe(req, channelId, ['message']);
    return next();
  },

  'unitjoin': function(req, res, next) {
    var channelId = req.param('channelId');
    Channel.subscribe(req, channelId, ['message']);
    return next();
  },

  'unitleave': function(req, res, next) {
    var channelId = req.param('channelId');
    Channel.unsubscribe(req, channelId, ['message']);
    return next();
  }
};
