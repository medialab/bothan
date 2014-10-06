/**
 * Bothan Spawn
 * =============
 *
 * A phantomjs child process spawner. Returns a spy object to handle.
 */
var path = require('path'),
    cp = require('child_process'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    phantomjs = require('phantomjs'),
    helpers = require('../shared/helpers.js'),
    config = require('../shared/config.js');

// Internals
var counter = 0;

// Spy class
function Spy(name, spynet, phantom) {
  var self = this;

  // Extending an Event Emitter
  EventEmitter.call(this);

  // Properties
  this.name = name;
  this.phantom = phantom;
  this.killed = false;

  // Binding some of the messenger methods
  this.send = function(head, message) {
    return spynet.messenger.to(this.name).send(head, message);
  };

  this.request = function(head, message, params) {
    return spynet.messenger.to(this.name).request(head, message, params);
  };

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
      self.emit('phantom:closed', {code: code, signal: signal});
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
  this.killed = true;
  this.phantom.kill();
};

// Spawner
module.exports = function(spynet, params, callback) {
  params = params || {};

  // Giving a name
  var name = params.name || 'spy' + (counter++);

  // Composing unix command
  var args = [];

  // Main script location
  args.push(path.join(__dirname + '/../phantom/main.js'));

  // JSON parameters
  args.push(JSON.stringify({
    passphrase: config.passphrase,
    port: params.port || config.port,
    debug: params.debug,
    name: name,
    bindings: params.bindings || null
  }));

  // Command line arguments for phantom
  args.concat(helpers.toCLIArgs(params.args || {}));

  // Spawning
  var phantom = cp.execFile(phantomjs.path, args),
      spy = new Spy(name, spynet, phantom);

  // Waiting for handshake
  var failureTimeout = setTimeout(function() {
    spy.kill();
    callback(new Error('timeout'));
  }, 2000);

  spynet.messenger.from(name).once('handshake', function(data, reply) {
    clearTimeout(failureTimeout);
    reply({ok: true});
    callback(null, spy);
  });
};
