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

    if (typeof callback !== 'function')
      throw Error('bothan.deploy: no valid callback provided.');

    if (!(spynet instanceof Spynet))
      throw Error('bothan.deploy: provided spynet instance is not valid.');

    if (!spynet)
      spynet = new Spynet({port: params.port});

    spawn(spynet, params, callback);
  }
};
