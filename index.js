/**
 * Bothan Public Interface
 * ========================
 *
 * Exports Bothan main class.
 */
var helpers = require('./shared/helpers.js'),
    Spynet = require('./src/spynet.js'),
    Spy = require('./src/spy.js');

// Caching the spynet server
var spynet = null;

function Bothan(params) {
  var _this = this;

  // If the spynet server is not already running, we launch it
  if (!spynet)
    spynet = new Spynet(params);

  // Properties
  this.spy = new Spy(params);
}

module.exports = Bothan;
