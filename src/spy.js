/**
 * Bothan Spy
 * ===========
 *
 * Abstraction handling a phantomjs child process.
 */
var EventEmitter = require('events').EventEmitter,
    cp = require('child_process'),
    phantomjs = require('phantomjs'),
    helpers = require('../shared/helpers.js'),
    config = require('../shared/config.js'),
    spynet = require('./spynet.js'),
    util = require('util');

function Spy(name, args, params) {
  var self = this;

  // Extending an Event Emitter
  EventEmitter.call(this);

  // Properties
  this.name = name;
  this.args = args;
  this.params = params;
  this.phantom = null;
  this.socket = null;

  // Killing the child process with parent
  this.processHandle = function() {
    self.kill();
  };

  process.on('exit', this.processHandle);

  // Autorestart?
  this.on('crash', function() {
    if (this.params.autoRestart)
      this.restart();
    else
      this.kill();
  });
}

util.inherits(Spy, EventEmitter);

// Spy Prototype
Spy.prototype.start = function(callback) {
  var self = this,
      timeout = this.params.handshakeTimeout || config.handshakeTimeout;

  callback = callback || Function.prototype;

  spynet.waitForHandshake(this, timeout, function(err, socket) {
    if (err) {
      self.kill();
      return callback(err);
    }

    // Registering socket
    self.socket = socket;
    self.enableCommunication();

    // Emitting events
    self.emit('ready');

    // Firing callback
    callback(null);
  });

  // Spawning child process
  this.phantom = cp.execFile(this.params.path || phantomjs.path, this.args);

  // On stdout
  this.phantom.stdout.on('data', function(data) {
    data = data.substring(0, data.length - 1);

    if (~data.search(/Error:/))
      self.emit('error', data);
    else
      self.emit('log', data);
  });

  // On stderr
  this.phantom.stderr.on('data', function(data) {
    self.emit('error', data);
  });

  // On close
  this.phantom.once('close', function(code, signal) {
    self.emit('close', code, signal);

    if (code !== 0 && code !== null)
      self.emit('crash', code);
  });

  return this;
};

Spy.prototype.enableCommunication = function() {
  var self = this;

  this.socket.on('message', function(msg) {
    var parsedMsg = JSON.parse(msg);
    self.emit(parsedMsg.head, parsedMsg);
  });

  this.send = function(head, body) {
    this.socket.send(JSON.stringify({
      head: head,
      body: body
    }));

    return this;
  };

  this.request = helpers.request.bind(null, this.socket);
  this.replyTo = helpers.replyTo.bind(null, this.socket);
};

Spy.prototype.kill = function(soft) {

  // Removing from spynet and killing listeners if hard kill
  if (soft !== false) {
    spynet.dropSpy(this.name);
    this.removeAllListeners();
  }

  // Killing the child process
  process.removeListener('exit', this.processHandle);
  this.phantom.kill();
};

Spy.prototype.restart = function(callback) {
  this.kill(false);
  this.start(callback);
};

module.exports = Spy;
