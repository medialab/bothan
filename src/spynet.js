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
    EventEmitter = require('events').EventEmitter,
    http = require('http'),
    uuid = require('uuid'),
    Messenger = require('colback').messenger,
    config = require('../shared/config.js'),
    helpers = require('../shared/helpers.js');

var defaults = {
  port: config.port
};

// Main class
function Spynet(p) {
  var self = this,
      ee = new EventEmitter();

  // Extending default settings
  params = helpers.extend(p || {}, defaults);

  // Launching server
  this.name = params.name || 'Spynet[' + uuid.v4() + ']';
  this.server = new WebSocketServer({port: params.port});

  // Extending server
  this.server.broadcast = function(data) {
    this.clients.forEach(function(client) {
      client.send(data);
    });
  };

  // Building messenger
  this.messenger = new Messenger({
    name: this.name,
    emitter: function(data) {
      self.server.broadcast(JSON.stringify(data));
    },
    receptor: function(callback) {
      ee.on('message', callback);
    }
  });

  // On socket connection
  this.server.on('connection', function(socket) {
    socket.on('message', function(data) {
      ee.emit('message', JSON.parse(data));
    });
  });

  // On socket disconnection
}

// Prototype
Spynet.prototype.close = function() {
  return this.server.close();
};

module.exports = Spynet;
