/**
 * Bothan Public Interface
 * ========================
 *
 * Exports Bothan main functions.
 */
var Spynet = require('./src/spynet.js'),
    spawn = require('./src/spawn.js');

module.exports = {
  Spynet: Spynet,
  deploy: function(spynet, params, callback) {

  }
};

// If no spynet is provided, we give one
