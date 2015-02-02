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

// Injecting polyfills
if (phantom.version.major < 2)
  require('./polyfills.js');

// Checking CLI arguments so we get proper configuration from parent
var params = JSON.parse(args[1]);

if (params.passphrase !== config.passphrase)
  throw Error('bothan.phantom: wrong JSON configuration provided.');

// Fixing error to stderr
console.error = function () {
  system.stderr.write(Array.prototype.join.call(arguments, ' ') + '\n');
};

// Setup the comlink
comlink.setup(params, function(err, parentObject) {

  // If the socket server timed out, we exit
  if (err)
    return phantom.exit(1);

  // Executing bindings
  if (params.bindings)
    require(params.bindings)(parentObject, params.data);
});
