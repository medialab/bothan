/**
 * Bothan Cluster
 * ===============
 *
 * Spawn an array of phantomjs child processes to handle.
 */
var EventEmitter = require('events').EventEmitter,
    spawn = require('./spawn.js'),
    helpers = require('../shared/helpers.js'),
    async = require('async'),
    util = require('util');

// Main class
function Cluster(params) {

  EventEmitter.call(this);

  // Properties
  this.params = params;
  this.spies = {};
  this.length = 0;
}

util.inherits(Cluster, EventEmitter);

// Prototype
Cluster.prototype.start = function(callback) {
  var self = this;

  var tasks = helpers.range(this.params).map(function() {
    return function(next) {
      spawn(function(err, spy) {
        if (err)
          return next(err);

        self.spies[spy.name] = spy;
        self.length++;
        next(null);
      });
    };
  });

  async.parallel(tasks, callback);
};

Cluster.prototype.kill = function() {
  var k;

  for (k in this.spies) {
    this.spies[k].kill();
  }

  return this;
};

// Exporting
module.exports = function(params, callback) {
  if (typeof params !== 'number' || typeof callback !== 'function')
    throw Error('bothan.cluster: wrong parameters.');

  var cluster = new Cluster(params);

  cluster.start(function(err) {
    if (err)
      callback(err);

    callback(null, cluster);
  });
};
