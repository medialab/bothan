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
    util = require('util'),
    helpers = require('../shared/helpers.js'),
    config = require('../shared/config.js');

// Singleton
function Spynet() {
  var self = this;

  // Extending EventEmitter
  EventEmitter.call(this);

  // Properties
  this.name = 'Spynet';
  this.port = config.port;

  this.server = null;
  this.running = false;
  this.hanging = false;
  this.hang = null;
  this.spies = {};
}

util.inherits(Spynet, EventEmitter);

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
    return this.once('listened', function(err) {
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
    self.emit('listened', err);
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

    // On socket connection
    self.server.on('connection', function(socket) {

      // On incoming message
      socket.once('message', function(msg) {
        var parsedMsg = JSON.parse(msg);

        // Registering socket
        self.addSpy(parsedMsg.body.from, parsedMsg.id, socket);
      });
    });

    self.emit('listened');

    errback(null);
  });
};

Spynet.prototype.waitForHandshake = function(spy, timeout, callback) {
  var self = this,
      name = spy.name + ':handshake';

  var failure = setTimeout(function() {
    self.removeListener(name, listener);
    callback(new Error('handshake-timeout'));
  }, timeout);

  var listener = function(reqId) {
    var socket = self.spies[spy.name].socket;
    clearTimeout(failure);
    helpers.replyTo(socket, reqId);
    callback(null, socket);
  };

  this.once(name, listener);
};

Spynet.prototype.addSpy = function(name, reqId, socket) {
  this.spies[name] = {
    socket: socket
  };
  this.emit(name + ':handshake', reqId);
  return this;
};

Spynet.prototype.dropSpy = function(name) {
  if (name in this.spies)
    delete this.spies[name];

  // Closing server at next tick to let code fix things up before terminating
  if (!Object.keys(this.spies).length)
    process.nextTick((function() {
      this.close();
    }).bind(this));
  return this;
};

Spynet.prototype.close = function() {
  if (!this.running)
    return;

  // Dropping listeners
  this.removeAllListeners();

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
