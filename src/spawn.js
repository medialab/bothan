/**
 * Bothan Spawn
 * =============
 *
 * A phantomjs child process spawner. Return a spy object to handle.
 */

 // TODO: a spy need to extend its own event emitter

var path = require('path'),
    cp = require('child_process'),
    phantomjs = require('phantomjs'),
    helpers = require('../shared/helpers.js'),
    config = require('../shared/config.js');

// Spy class
function Spy() {

}

// Spawner
module.exports = function(spynet, params, callback) {

};
