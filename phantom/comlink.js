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

// Helpers
function endpoint(host, port) {
  return 'ws://' + (host || 'localhost') + ':' + (port || config.port);
}

// Main class
function Comlink() {
  var self = this;

  // Properties
  this.ws = null;
  this.messenger = null;
  this.connected = false;

  // Methods
  this.setup = function(params, next) {
    params = params || {};

    // Connecting to websocket server
    this.ws = new WebSocket(endpoint(params.host, params.port));

    // Waiting for effective connection
    this.ws.onopen = function() {
      self.connected = true;

      // Creating messenger
      self.messenger = new Messenger({
        name: params.name,
        receptor: function(callback) {
          self.ws.onmessage = function(msg) {
            callback(JSON.parse(msg.data));
          };
        },
        emitter: function(data) {
          self.ws.send(JSON.stringify(data));
        }
      });

      // Performing handshake
      self.messenger.to('Spynet').request('handshake').then(function(response) {

        // Next
        next();
      });
    };
  }
}

module.exports = new Comlink();
