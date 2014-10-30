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
    Messenger = require('estafet'),
    config = require('../shared/config.js');

// Singleton
function Spynet() {
  var self = this;

  // Properties
  this.ee = new EventEmitter();
  this.name = 'Spynet';
  this.port = config.port;
  this.server = null;
  this.messenger = null;
  this.running = false;
  this.spies = [];
}

// Prototype
Spynet.prototype.listen = function(port) {
  var self = this;

  if (this.running)
    throw Error('bothan.spynet: already running.');

  this.port = port || config.port;

  // Launching server
  this.server = new WebSocketServer({port: this.port});
  this.running = true;

  // Extending the server for broadcast
  this.server.broadcast = function(data) {
    this.clients.forEach(function(client) {
      client.send(data);
    });
  };

  // Building the messenger
  this.messenger = new Messenger(this.name, {
    emitter: function(data) {
      self.server.broadcast(JSON.stringify(data));
    },
    receptor: function(callback) {
      self.ee.on('message', callback);
    }
  });

  // On socket connection
  // TODO: assign name to socket so we can be finer than broadcast
  this.server.on('connection', function(socket) {
    socket.on('message', function(data) {
      self.ee.emit('message', JSON.parse(data));
    });
  });

  // TODO: Handle socket disconnection

  return this;
};

Spynet.prototype.close = function() {

  // Shooting messenger
  this.messenger.shoot();
  this.messenger = null;

  // Closing server
  this.server.close();
  this.server = null;

  // State
  this.running = false;
  return this;
};

module.exports = new Spynet();
