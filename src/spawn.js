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
    config = require('../shared/config.js');

// Spy class
function Spy(name, spynet, phantom) {
  var self = this;

  // Extending an Event Emitter
  EventEmitter.call(this);

  // Properties
  this.name = name;
  this.phantom = phantom;
  this.killed = false;
  this.spynet = spynet;

  // Binding some of the messenger methods
  this.messenger = spynet.messenger.conversation(name);

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
  this.phantom.on('close', function(code, signal) {
    if (!self.killed)
      self.emit('phantom:close', {code: code, signal: signal});
    self.killed;
  });

  // Killing the child process with parent
  process.on('exit', function() {
    self.kill();
  });
}

util.inherits(Spy, EventEmitter);

// Spy Prototype
Spy.prototype.kill = function() {
  if (this.killed)
    return;

  this.killed = true;
  this.phantom.kill();
};

// Spawner
module.exports = function(spynet, params, callback) {
  params = params || {};

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
    spynet: spynet.name,
    bindings: params.bindings || null,
    data: params.data || {}
  }));

  // Command line arguments for phantom
  args = args.concat(helpers.toCLIArgs(params.args || {}));

  // Spawning
  var phantom = cp.execFile(phantomjs.path, args),
      spy = new Spy(name, spynet, phantom);

  // Waiting for handshake
  var failureTimeout = setTimeout(function() {
    spy.kill();
    callback(new Error('handshake-timeout'));
  }, params.handshakeTimeout || 5000);

  spy.messenger.once('handshake', function(data, reply) {
    clearTimeout(failureTimeout);
    reply({ok: true});

    callback(null, spy);
  });
};
