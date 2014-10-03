/**
 * Bothan Unit Tests
 * ==================
 *
 */

var assert = require('assert'),
    bothan = require('../index.js');

describe('Bothan deployment', function() {
  it('should occur correctly', function() {
    bothan.deploy({params: 4000}, function(spy) {
      spy.send('message', {hello: 'world'});
    });
  });
});
