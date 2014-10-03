/**
 * Bothan Spynet
 * ==============
 *
 * Spynet is a websocket server aiming at communicating with phantomjs child
 * processes.
 *
 * One spynet can monitor one to many phantomjs processes, while the latter can
 * only refer to one spynet instance.
 */

// Dependencies
var WebSocketServer = require('ws').Server,
    http = require('http'),
    Messenger = require('colback').messenger,
    config = require('../config.json'),
    helpers = require('../shared/helpers.js');

var defaults = {
  port: config.port
};

var name = 0;

// Main class
function Spynet(params) {
  var self = this;

  // Extending default settings
  params = helpers.extend(params || {}, defaults);

  // Launching server
  this.server = new WebSocketServer({port: params.port});
  this.sockets = [];

  // On socket connection
  this.server.on('connection', function(socket) {
    if (!~self.sockets.indexOf(socket))
      self.sockets.push(socket);
  });

  // On socket disconnection

  // var messenger = new Messenger({
  //   paradigm: 'modern',
  //   receptor: 'test',
  //   emitter: function(data) {
  //     var serializedData = JSON.stringify(dat);

  //   }
  // });
}

module.exports = Spynet;
