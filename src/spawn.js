/**
 * Bothan Spawn
 * =============
 *
 * A phantomjs child process spawner. Returns a spy object to handle.
 */
var path = require('path'),
    async = require('async'),
    cp = require('child_process'),
    fs = require('fs'),
    util = require('util'),
    uuid = require('uuid'),
    EventEmitter = require('events').EventEmitter,
    phantomjs = require('phantomjs'),
    helpers = require('../shared/helpers.js'),
    spynet = require('./spynet.js'),
    config = require('../shared/config.js');

// Spy class
function Spy(name, args, params) {
  var self = this;

  // Extending an Event Emitter
  EventEmitter.call(this);

  // Properties
  this.name = name;
  this.args = args;
  this.params = params;
  this.phantom = null;

  // Binding some of the messenger methods
  this.messenger = spynet.messenger.conversation(name);

  this.processHandle = function() {
    self.kill();
  };

  // Killing the child process with parent
  process.on('exit', this.processHandle);

  // Autorestart?
  this.on('phantom:crash', function() {
    if (this.params.autoRestart)
      this.restart();
    else
      this.kill();
  });
}

util.inherits(Spy, EventEmitter);

// Spy Prototype
Spy.prototype.start = function(callback) {
  var self = this;

  callback = callback || Function.prototype;

  // Waiting for handshake
  function handle(data, reply) {

    // Clearing the timeout
    clearTimeout(failureTimeout);

    // Replying to spy
    reply({ok: true});

    // Emitting events
    self.emit('phantom:ready');

    // Firing callback
    callback(null);
  }

  var failureTimeout = setTimeout(function() {
    self.kill();
    callback(new Error('handshake-timeout'));
  }, this.params.handshakeTimeout || config.handshakeTimeout);

  this.messenger.once('handshake', handle);

  // Spawning child process
  this.phantom = cp.execFile(this.params.path || phantomjs.path, this.args);

  // On stdout
  this.phantom.stdout.on('data', function(data) {
    data = data.substring(0, data.length - 1);

    if (~data.search(/Error:/))
      self.emit('phantom:error', data);
    else
      self.emit('phantom:log', data);
  });

  // On stderr
  this.phantom.stderr.on('data', function(data) {
    self.emit('phantom:error', data);
  });

  // On close
  this.phantom.once('close', function(code, signal) {
    self.emit('phantom:close', code, signal);

    if (code !== 0 && code !== null)
      self.emit('phantom:crash', code);
  });

  return this;
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

// Spawner
module.exports = function(params, callback) {
  if (arguments.length < 2) {
    callback = params;
    params = null;
  }

  params = params || {};

  async.series({
    path: function(next) {

      if (params.path)
        if (fs.existsSync(params.path) && fs.lstatSync(params.path).isFile())
          return next(null);
        else
          return next(new Error('invalid-phantom-path'));
      else
        return next(null);
    },
    spynet: function(next) {
      if (!spynet.running)
        spynet.listen(function(err) {
          if (err) {
            if (err.code === 'EACCES' || err.code === 'EADDRINUSE')
              return next(new Error('unavailable-port'));
            else
              return next(err);
          }
          return next(null);
        });
      else
        return next(null);
    },
    spy: function(next) {

      // Giving a name
      var name = params.name || 'Spy[' + uuid.v4() + ']';

      // Composing unix command
      var args = [];

      // Main script location
      args.push(path.join(__dirname + '/../phantom/main.js'));

      // JSON parameters
      args.push(JSON.stringify({
        name: name,
        passphrase: config.passphrase,
        port: spynet.port,
        bindings: params.bindings || null,
        data: params.data || {}
      }));

      // Command line arguments for phantom
      args = args.concat(helpers.toCLIArgs(params.args || {}));

      // Spawning
      var spy = new Spy(name, args, params);

      // Starting
      return spy.start(function(err) {
        if (err)
          return next(err);
        else
          return next(null, spy);
      });
    }
  }, function(err, result) {
    if (err)
      return callback(err);
    else
      return callback(null, result.spy);
  });
};
