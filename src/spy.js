/**
 * Bothan Spy
 * ===========
 *
 * A phantomjs child process controller.
 */

var path = require('path'),
    cp = require('child_process'),
    phantomjs = require('phantomjs'),
    options = require('./options.js');

function Spy(params) {
  var _this = this;
  params = params || {};

  var args = [path.join(__dirname + '/../phantomjs/main.js')].concat([
    options(params.phantom),
    JSON.stringify({
      identity: 'many bothans died to bring us this information',
      port: params.port,
      id: 'todo'
    })
  ]);

  // Starting child process
  this.phantom = cp.execFile(phantomjs.path, args);

  // Methods
  this.kill = function() {
    this.phantom.kill();
  };

  // Events
  process.on('exit', function() {
    _this.kill();
  });

  // DEBUG
  this.phantom.stdout.on('data', function() {
    console.log(arguments);
  });
}

module.exports = Spy;
