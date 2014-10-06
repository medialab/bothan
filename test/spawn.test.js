var assert = require('assert'),
    Spynet = require('../src/spynet.js'),
    spawn = require('../src/spawn.js');

describe('spawn', function() {
  var spynet = new Spynet({port: 8074});

  it('should be able to spawn a simple phantom.', function(done) {
    spawn(spynet, {name: 'simple'}, function(err, spy) {
      assert(spy.name === 'simple');
      spy.kill();
      done();
    });
  });
});
