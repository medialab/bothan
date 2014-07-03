/**
 * Bothan Spynet
 * ==============
 *
 * Functions to spawn a WebSocket server that will be used to communicate with
 * a child process of phantomjs.
 */

var io = require('socket.io'),
    http = require('http'),
    config = require('../config.json'),
    extend = require('../shared/helpers.js').extend;

function Spynet(params) {
  p = extend(params, {port: config.port});

  var endpoint = 'http://localhost:' + p.port;

  // Creating http server
  this.server = http.createServer(function(req, res, body) {
    res.writeHead(200);
    return res.end(
      '<!doctype html>' +
      '<html>' +
        '<head>' +
          '<title>Spynet</title>' +
        '</head>' +
        '<body>' +
          'Hello Phantom!' +
          '<input id="endpoint" type="hidden" value="' + endpoint + '" />' +
          '<script type="text/javascript" src="' +
          endpoint + '/socket.io/socket.io.js' + '" ></script>' +
        '</body>' +
      '</html>'
    );
  });

  // Bootstrapping socket server
  this.sockets = io(this.server);

  // Start listening
  this.server.listen(p.port);

  // Callbacks
  this.sockets.on('connection', function(socket) {
    console.log('connection made');
    socket.on('message', function(from, msg) {
      console.log(from, msg);
    });
  });
}

module.exports = Spynet;
