/**
 * Bothan Public Interface
 * ========================
 *
 * Exports Bothan main class.
 */
var helpers = require('./shared/helpers.js'),
    spynet = require('./src/spynet.js'),
    spy = require('./src/spy.js');

// TODO: if port in use, fallback
var usedPorts = [];

function Bothan(params) {
  var _this = this,
      p = helpers.extend(params, {port: 8074});

  // Properties
  this.phantom = null;
  this.server = null;

  // Initialization
  this.deploy = function(cb) {

    // Launching server
    // TODO: launch only once please
    spynet.create(p, function(server) {
      this.server = server;

      this.phantom = spy.spawn(p);

      // TEST
      this.phantom.stdout.on('data', function(data) {
        console.log(data.toString());
      });
    });
  };
}

module.exports = Bothan;
