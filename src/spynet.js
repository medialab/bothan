/**
 * Bothan Spynet
 * ==============
 *
 * Functions to spawn a WebSocket server that will be used to communicate with
 * a child process of phantomjs.
 */

var http = require('http'),
    WebSocket = require('faye-websocket');

function create(params, cb) {
  var server = http.createServer();

  server.on('upgrade', function(request, socket, body) {
    if (!WebSocket.isWebSocket(request))
      return;

    var ws = new WebSocket(request, socket, body);
  });

  server.listen(params.port, function() {
    cb(server);
  });
}

module.exports = {
  create: create
};
