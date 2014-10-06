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
  this.spynet = spynet;
  this.phantom = phantom;

  // Registering some events
  this.phantom.stdout.on('data', function(data) {
    if (~data.search(/Error:/))
      self.emit('phantom:error', data);
    else
      self.emit('phantom:log', data);
  });

  this.phantom.stderr.on('data', function(data) {
    self.emit('phantom:error', data);
  });

  // Killing the child process with parent
  process.on('exit', function() {
    self.kill();
  });
}

util.inherits(Spy, EventEmitter);

// Spy Prototype
Spy.prototype.kill = function() {
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
    name: name
  }));

  // Command line arguments for phantom
  args.concat(helpers.toCLIArgs(params.args || {}));

  // Spawning
  var phantom = cp.execFile(phantomjs.path, args),
      spy = new Spy(name, spynet, phantom);

  // Waiting for handshake
  var failureTimeout = setTimeout(function() {
    callback(new Error('timeout'));
  }, 2000);

  spynet.from(name).on('handshake', function(data, reply) {
    clearTimeout(failureTimeout);
    reply({ok: true});
    callback(null, spy);
  });
};
