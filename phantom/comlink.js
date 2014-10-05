/**
 * Bothan Phantomjs Comlink
 * =========================
 *
 * The Comlink class enables direct communication, through websockets, with the
 * parent of the phantom child process.
 */
var Messenger = require('colback').messenger,
    helpers = require('../shared/helpers.js'),
    config = require('../shared/config.js');

// Main class
function Comlink(params) {
  var self = this;
  params = params || {};

  // Properties
  this.ws = null;
  this.messenger = null;
  this.connected = false;

  // Methods
  this.setup = function(callback) {

    // Connecting to websocket server
    this.ws = new WebSocket('ws://localhost:' + (params.port || config.port));

    // Waiting for effective connection
    this.ws.onopen = function() {
      self.connected = true;
    };
  }
}

module.exports = new Comlink();
