/**
 * Bothan Spawner
 * ===============
 *
 * A phantomjs child process spawner. Return a spy object to handle.
 */

var path = require('path'),
    cp = require('child_process'),
    phantomjs = require('phantomjs'),
    options = require('./options.js');

// Persistent state
var counter = 0;

// Spy Class
function Spy(id, spynet, phantom) {
  var self = this;

  // Properties
  this.id = id;
  this.phantom = phantom;
  this.spynet = spynet;
  this.connected = false;

  // Events
  process.on('exit', function() {
    self.kill();
  });
}

Spy.prototype.kill = function() {
  this.phantom.kill();
};

Spy.prototype.on = function(header, fn) {
  return this.spynet.on(this.id, header, fn);
};

Spy.prototype.send = function(header, fn) {
  return this.spynet.send(this.id, header, fn);
};

// Spawning function
function spawn(params, spynet, cb) {
  params = params || {};

  var id = counter++;

  var args = [path.join(__dirname + '/../phantomjs/main.js')].concat([
    JSON.stringify({
      identity: 'many bothans died to bring us this information',
      port: params.port,
      id: id
    })
  ]);

  var phantom = cp.execFile(phantomjs.path, args);

  var spy = new Spy(id, spynet, phantom);

  // DEBUG
  if (params.debug)
    spy.phantom.stdout.on('data', function(data) {
      console.log(data);
    });

  // Waiting for handshake
  var timeout = setTimeout(function() {
    if (!spy.connected)
      throw 'bothan.spawner: child timed out.';
  }, 3000);

  spynet.on(id, 'handshake', function() {
    clearTimeout(timeout);
    spy.connected = true;
    cb(spy);
  });
}

module.exports = spawn;
