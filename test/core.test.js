var assert = require('assert'),
    bothan = require('../index.js');

var noop = function() {};

describe('core API', function() {

  it('should throw errors when used badly.', function() {
    assert.throws(function() {
      bothan.deploy({port: 6000}, 'test');
    }, Error);

    assert.throws(function() {
      bothan.deploy({hello: 'world'}, {port: 6000}, noop);
    }, Error);
  });
});
