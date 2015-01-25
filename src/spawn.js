/**
 * Bothan Spawn
 * =============
 *
 * A phantomjs child process spawner. Returns a spy object to handle.
 */
var path = require('path'),
    async = require('async'),
    fs = require('fs'),
    Spy = require('./spy.js'),
    helpers = require('../shared/helpers.js'),
    spynet = require('./spynet.js'),
    config = require('../shared/config.js');

module.exports = function(params, callback) {
  if (arguments.length < 2) {
    callback = params;
    params = null;
  }

  params = params || {};

  async.series({
    path: function(next) {

      if (params.path)
        if (fs.existsSync(params.path) && fs.lstatSync(params.path).isFile())
          return next(null);
        else
          return next(new Error('invalid-phantom-path'));
      else
        return next(null);
    },
    spynet: function(next) {
      if (!spynet.running)
        spynet.listen(function(err) {
          if (err) {
            if (err.code === 'EACCES' || err.code === 'EADDRINUSE')
              return next(new Error('unavailable-port'));
            else
              return next(err);
          }
          return next(null);
        });
      else
        return next(null);
    },
    spy: function(next) {

      // Giving a name
      var name = params.name || 'Spy[' + helpers.uuid() + ']';

      // Composing unix command
      var args = [];

      // Main script location
      args.push(path.join(__dirname + '/../phantom/main.js'));

      // JSON parameters
      args.push(JSON.stringify({
        name: name,
        passphrase: config.passphrase,
        port: spynet.port,
        bindings: params.bindings || null,
        data: params.data || {}
      }));

      // Command line arguments for phantom
      args = args.concat(helpers.toCLIArgs(params.args || {}));

      // Spawning
      var spy = new Spy(name, args, params);

      // Starting
      return spy.start(function(err) {
        if (err)
          return next(err);
        else
          return next(null, spy);
      });
    }
  }, function(err, result) {
    if (err)
      return callback(err);
    else
      return callback(null, result.spy);
  });
};
