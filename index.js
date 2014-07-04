/**
 * Bothan Public Interface
 * ========================
 *
 * Exports Bothan main functions.
 */
var helpers = require('./shared/helpers.js'),
    config = require('./config.json'),
    Spynet = require('./src/spynet.js'),
    spawn = require('./src/spawn.js');

// Caching the spynet server
var spynet = null;

function deploy(params, cb) {

  // Polymorphism
  if (typeof params === 'function') {
    cb = params;
    params = {};
  }

  // Merging defaults
  var p = helpers.extend(params, config);

  // If spynet is not already online, we create it
  if (!spynet)
    spynet = new Spynet(p);

  // Spawning a spy
  spawn(p, spynet, function(spy) {
    cb(spy);
  });
}

module.exports = {
  deploy: deploy
};
