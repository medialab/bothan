/**
 * Bothan Spawn
 * =============
 *
 * A phantomjs child process spawner. Returns a spy object to handle.
 */
var path = require('path'),
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
  this.killed = false;

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
    spy.kill();
    callback(new Error('handshake-timeout'));
  }, timeout || 5000);

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
    if (!self.killed)
      self.emit('phantom:close', {code: code, signal: signal});
    self.killed;
  });

  return this;
};

Spy.prototype.kill = function() {
  if (this.killed)
    return;

  this.killed = true;
  this.phantom.kill();
};

// Spawner
module.exports = function(params, callback) {
  params = params || {};

  // Starting spynet if not running
  if (!spynet.running)
    spynet.listen();

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
      return callback(err);
    else
      return callback(null, spy);
  });
};
