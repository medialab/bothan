var assert = require('assert'),
    Spynet = require('../src/spynet.js'),
    spawn = require('../src/spawn.js');

describe('spawn', function() {
  var spynet = new Spynet({port: 8074});

  describe('basic cases', function() {
    it('should be able to spawn a simple phantom.', function(done) {
      spawn(spynet, {name: 'simple'}, function(err, spy) {
        assert(err === null);
        assert(spy.name === 'simple');
        spy.kill();
        done();
      });
    });
  });

  describe('bindings and subscriptions', function() {
    var spy = null;

    it('should be able to execute simple bindings.', function(done) {
      var params = {
        name: 'bindings',
        bindings: __dirname + '/resources/simple_bindings.js'
      };

      spawn(spynet, params, function(err, createdSpy) {
        spy = createdSpy;

        spynet.messenger.once('ok', function(res) {
          assert(res.ok);
          done();
        });
      });
    });

    it('should be possible to subscribe to the child process log.', function(done) {
      spy.once('phantom:log', function(data) {
        assert.strictEqual(data, 'Hello world!');
        done();
      });

      spynet.messenger.to('bindings').send('hello');
    });

    it('should be possible to subscribe to the child process errors.', function(done) {
      spy.once('phantom:error', function(data) {
        assert(!!~data.search(/Achtung!/));
        done();
      });

      spynet.messenger.to('bindings').send('error');
    });

    after(function() {
      spy.kill();
    });
  });
});
