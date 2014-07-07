/**
 * Bothan Phantomjs Main Hub
 * ==========================
 *
 * Phantomjs main controller.
 */
var system = require('system'),
    comlink = require('./comlink.js'),
    Pager = require('./pager.js');

function checkArguments() {
  var jsonParams = system.args[system.args.length - 1],
      params;

  try {
    params = JSON.parse(jsonParams);
  }
  catch (e) {
    return false;
  }

  return params.identity === 'many bothans died to bring us this information' &&
    params;
}

var params = checkArguments();

// Setup the comlink
comlink.setup(params);
comlink.handshake();

// Starting the pager
var pager = new Pager(comlink, params);
