/**
 * Bothan Unit Tests
 * ==================
 *
 */

var assert = require('assert'),
    Bothan = require('../index.js');

describe('Bothan deployment', function() {
  it('should occur correctly', function() {
    var b = new Bothan();
    b.deploy(function() {
      console.log('Bothan deployed.');
    });
  });
});
