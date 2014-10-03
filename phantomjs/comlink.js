/**
 * Bothan Phantomjs Comlink
 * =========================
 *
 * Connect to a WebSocket server for messaging purposes.
 */

function Comlink() {
  var self = this;

  // Properties
  this.params = null;
  this.connected = false;
  this.ws = null;
  this.listeners = {};

  // Initialization
  this.setup = function(params) {

    // Cleanup
    this.ws = null;
    this.listeners = {};
    this.params = params;

    // Connecting
    this.ws = new WebSocket('ws://localhost:' + params.port);

    // Checking connection
    this.ws.onopen = function() {
      self.connected = true;
    };

    // Binding events
    this.ws.onmessage = function(e) {
      var msg = JSON.parse(e.data);

      // Triggering callback if relevant
      if (msg.header in self.listeners)
        self.listeners[msg.header].forEach(function(l) {
          l(msg.data);
        });
    };
  };

  // Methods
  this.send = function(header, data) {
    var msg = {header: header, data: data, id: this.params.id};

    function checkConnection() {
      if (self.connected)
        _send();
      else
        setTimeout(checkConnection, 300);
    }

    // Looping
    checkConnection();

    function _send() {
      self.ws.send(JSON.stringify(msg));
    }
  };

  this.handshake = function() {
    this.send('handshake');
  };

  this.on = function(header, fn)  {
    if (typeof fn !== 'function')
      throw TypeError('Phantom.Comlink.on: second argument is not a function.');

    this.listeners[header] = this.listeners[header] || [];
    this.listeners[header].push(fn);

    return this;
  };
}

// Singleton export
module.exports = new Comlink();
