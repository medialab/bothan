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

function spawn(params) {
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
  return cp.execFile(phantomjs.path, args, function(err, stdout, stderr) {
    if (err) {
      // TODO...
    }
  });
}

module.exports = {
  spawn: spawn
};
