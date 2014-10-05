/**
 * Bothan Phantomjs Main Script
 * =============================
 *
 * This controller script is launched on any bothan child process.
 */
var system = require('system'),
    args = system.args,
    config = require('../shared/config.js');

// Checking CLI arguments so we get proper configuration from parent
var params = JSON.parse(args[1]);

if (params.passphrase !== config.passphrase)
  throw Error('bothan.phantom: wrong JSON configuration provided.');
