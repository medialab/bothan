/**
 * Bothan Phantomjs Main Script
 * =============================
 *
 * This controller script is launched on any bothan child process.
 */
var system = require('system'),
    args = system.args,
    config = require('../shared/config.js'),
    comlink = require('./comlink.js');

// Checking CLI arguments so we get proper configuration from parent
var params = JSON.parse(args[1]);

if (params.passphrase !== config.passphrase)
  throw Error('bothan.phantom: wrong JSON configuration provided.');

// Fixing error to stderr
console.error = function () {
  system.stderr.write(Array.prototype.join.call(arguments, ' ') + '\n');
};

// Setup the comlink
comlink.setup(params, function(err) {

  // If the socket server timed out, we exit
  if (err)
    return phantom.exit(1);

  // Perform tricks here
  if (params.bindings)
    require(params.bindings)(comlink.messenger, params.data);
});
