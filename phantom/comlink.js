/**
 * Bothan Phantomjs Comlink
 * =========================
 *
 * The Comlink class enables direct communication, through websockets, with the
 * parent of the phantom child process.
 */
var helpers = require('../shared/helpers.js'),
    config = require('../shared/config.js'),
    EventEmitter = require('events').EventEmitter;

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
  this.parent = null;
  this.connected = false;
  this.ee = new EventEmitter();

  // Methods
  // TODO: implement a phantom-side timeout
  this.setup = function(params, next) {
    params = params || {};

    // Connecting to websocket server
    this.ws = new WebSocket(endpoint(params.host, params.port));

    // Waiting for effective connection
    this.ws.onopen = function() {
      self.connected = true;

      // Event delegation
      function delegate(name) {
        return self.ee[name].bind(self.ee);
      }

      self.ws.addEventListener('message', function(msg) {
        var parsedMsg = JSON.parse(msg.data);
        self.ee.emit(parsedMsg.head, parsedMsg);
      });

      // Constructing parent abstraction
      self.parent = {
        request: helpers.request.bind(null, self.ws),
        send: function(head, body) {
          self.ws.send(JSON.stringify({
            from: params.name,
            head: head,
            body: body
          }));
        },
        replyTo: helpers.replyTo.bind(null, self.ws),
        on: delegate('on'),
        once: delegate('once'),
        removeListener: delegate('removeListener')
      };

      // Handshake
      self.parent.request('handshake', {from: params.name}, function(err) {
        if (err)
          return next(err);
        else
          return next(null, self.parent);
      });
    };
  };
}

module.exports = new Comlink();
