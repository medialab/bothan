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
    if (arguments.length === 2) {
      callback = params;
      params = spynet;
      spynet = null;
    }

    params = params || {};

    if (typeof callback !== 'function')
      throw Error('bothan.deploy: no valid callback provided.');

    if (!spynet) {
      var spynetParams = {};
      params.port && (spynetParams.port = params.port)
      spynet = new Spynet(spynetParams);
    }

    if (!(spynet instanceof Spynet))
      throw Error('bothan.deploy: provided spynet instance is not valid.');

    spawn(spynet, params, callback);
  }
};
