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
  this.hanging = false;
  this.hang = null;
  this.spies = {};
}

// Prototype
Spynet.prototype.listen = function(port, errback) {
  var self = this;

  if (arguments.length < 2) {
    errback = port;
    port = null;
  }

  if (typeof errback !== 'function')
    throw Error('bothan.spynet.listen: not callback provided.');

  if (this.running)
    throw Error('bothan.spynet.listen: already running.');

  if (this.hanging) {
    return this.ee.once('listened', function(err) {
      if (!err)
        errback(null);
      else
        errback(err);
    });
  }

  this.port = port || config.port;
  this.hanging = true;

  // Launching server
  this.server = new WebSocketServer({port: this.port});

  // On error
  this.server.once('error', function(err) {
    self.ee.emit('listened', err);
    self.hanging = false;
    self.running = false;
    errback(err);
  });

  // On success
  this.server.once('listening', function() {
    self.running = true;
    self.hanging = false;

    // Extending the server for broadcast
    self.server.broadcast = function(data) {
      this.clients.forEach(function(client) {
        client.send(data);
      });
    };

    // Building the messenger
    self.messenger = new Messenger(self.name, {
      emitter: function(data, to) {
        var str = JSON.stringify(data);

        if (!to)
          self.server.broadcast(str);
        else
          self.spies[to].socket.send(str);
      },
      receptor: function(callback) {
        self.ee.on('message', callback);
      }
    });

    // On socket connection
    self.server.on('connection', function(socket) {

      // On incoming message
      socket.on('message', function(str) {
        var data = JSON.parse(str);

        // Registering socket
        self.addSpy(data.from, socket);

        self.ee.emit('message', data);
      });
    });

    self.ee.emit('listened');

    errback(null);
  });
};

Spynet.prototype.addSpy = function(name, socket) {
  this.spies[name] = {
    socket: socket
  };
  return this;
};

Spynet.prototype.dropSpy = function(name) {
  if (name in this.spies)
    delete this.spies[name];

  if (!Object.keys(this.spies).length)
    this.close();
  return this;
};

Spynet.prototype.close = function() {
  if (!this.running)
    return;

  // Shooting messenger
  this.messenger.shoot();
  this.messenger = null;

  // Dropping listeners
  this.ee.removeAllListeners();

  // Dropping spies
  this.spies = {};

  // Closing server
  this.server.close();
  this.server = null;

  // State
  this.running = false;
  this.hanging = false;
  return this;
};

module.exports = new Spynet();
