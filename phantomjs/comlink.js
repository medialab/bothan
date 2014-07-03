/**
 * Bothan Phantomjs Comlink
 * =========================
 *
 * Connect to a WebSocket server for messaging purposes.
 */
var webpage = require('webpage');

var channel = new WebSocket('ws://localhost:4000');

// channel.send('ta mere');

function Comlink(params) {
  var _this = this;

  // Properties
  this.connected = false;
  this.page = webpage.create();

  // // Methods
  // this.connect = function(cb) {
  //   var p = this.page;

  //   p.open('http://localhost:' + params.port, function() {
  //     p.evaluate(function() {
  //       var endpoint = document.getElementById('endpoint').value,
  //           socket = io.connect(endpoint);
  //     });

  //     _this.connected = true;
  //     cb();
  //   });
  // };

  // this.send = function(data) {
  //   if (!_this.connected)
  //     return;

  //   var p = this.page;

  //   p.evaluate(function() {
  //     socket.send('message', data);
  //   });
  // };
}

module.exports = Comlink;
