/**
 * Bothan Phantomjs Main Hub
 * ==========================
 *
 * Phantomjs main controller.
 */
var system = require('system'),
    Comlink = require('./comlink.js');

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

var params = checkArguments(),
    comlink = new Comlink(params);

// Connecting to Spynet
// comlink.connect(function() {
//   comlink.send({hello: 'world'});
// });
