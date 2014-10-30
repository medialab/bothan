/**
 * Bothan Spawn
 * =============
 *
 * A phantomjs child process spawner. Returns a spy object to handle.
 */
var path = require('path'),
    async = require('async'),
    cp = require('child_process'),
    util = require('util'),
    uuid = require('uuid'),
    EventEmitter = require('events').EventEmitter,
    phantomjs = require('phantomjs'),
    helpers = require('../shared/helpers.js'),
    spynet = require('./spynet.js'),
    config = require('../shared/config.js');

// Spy class
function Spy(name, args) {
  var self = this;

  // Extending an Event Emitter
  EventEmitter.call(this);

  // Properties
  this.name = name;
  this.args = args;
  this.phantom = null;

  // Binding some of the messenger methods
  this.messenger = spynet.messenger.conversation(name);

  // Killing the child process with parent
  process.on('exit', function() {
    self.kill();
  });
}

util.inherits(Spy, EventEmitter);

// Spy Prototype
Spy.prototype.start = function(timeout, callback) {
  var self = this;

  // Spawning child process
  this.phantom = cp.execFile(phantomjs.path, this.args);

  // Waiting for handshake
  var failureTimeout = setTimeout(function() {
    self.kill();
    callback(new Error('handshake-timeout'));
  }, timeout || config.handshakeTimeout);

  this.messenger.once('handshake', function(data, reply) {
    clearTimeout(failureTimeout);
    reply({ok: true});

    callback(null);
  });

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
    self.emit('phantom:close', {code: code, signal: signal});
  });

  return this;
};

Spy.prototype.kill = function() {

  // Removing from spynet
  spynet.dropSpy(this.name);

  // Killing the child process
  this.phantom.kill();
};

// Spawner
module.exports = function(params, callback) {
  if (arguments.length < 2) {
    callback = params;
    params = null;
  }

  params = params || {};

  async.series({
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
      var spy = new Spy(name, args);

      // Starting
      return spy.start(params.handshakeTimeout, function(err) {
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
