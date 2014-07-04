/**
 * Bothan Spynet
 * ==============
 *
 * Functions to spawn a WebSocket server that will be used to communicate with
 * a child process of phantomjs.
 */

var WebSocketServer = require('ws').Server,
    http = require('http');

function Spynet(params) {
  var self = this,
  params = params || {};

  // Launching websocket server
  this.server = new WebSocketServer({port: params.port});
  this.listeners = {};
  this.sockets = {};

  // Events
  this.server.on('connection', function(ws) {

    ws.on('message', function(msg) {
      msg = JSON.parse(msg);

      if (!(msg.id in self.sockets))
        self.sockets[msg.id] = ws;

      if (msg.id in self.listeners && msg.header in self.listeners[msg.id])
        self.listeners[msg.id][msg.header].forEach(function(l) {
          l(msg.data, ws);
        });
    });
  });

  // Methods
  this.on = function(id, header, fn)  {
    if (typeof fn !== 'function')
      throw TypeError('bothan.Spynet.on: second argument is not a function.');

    if (!this.listeners[id])
      this.listeners[id] = {};
    if (!this.listeners[id][header])
      this.listeners[id][header] = [];

    this.listeners[id][header].push(fn);

    return this;
  };

  this.send = function(id, header, data) {
    if (!(id in this.sockets))
      throw Error('bothan.Spynet.send: inexistant socket for id: ' + id);

    this.sockets[id].send(JSON.stringify({header: header, data: data}));
    return this;
  };
}

module.exports = Spynet;
