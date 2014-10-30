/**
 * Bothan Public Interface
 * ========================
 *
 * Exports Bothan main functions.
 */
var spawn = require('./src/spawn.js');

module.exports = {
  deploy: function(params, callback) {
    if (arguments.length === 1) {
      callback = params;
      params = null;
    }

    params = params || {};

    if (typeof callback !== 'function')
      throw Error('bothan.deploy: no valid callback provided.');

    return spawn(params, callback);
  }
};
