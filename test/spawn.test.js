var assert = require('assert'),
    spawn = require('../src/spawn.js');

describe('spawn', function() {

  describe('basic cases', function() {
    it('should be able to spawn a simple phantom.', function(done) {
      spawn({name: 'simple'}, function(err, spy) {
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

      spawn(params, function(err, createdSpy) {
        spy = createdSpy;

        spy.messenger.once('ok', function(res) {
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

      spy.messenger.send('hello');
    });

    it('should be possible to subscribe to the child process errors.', function(done) {
      spy.once('phantom:error', function(data) {
        assert(!!~data.search(/Achtung!/));
        done();
      });

      spy.messenger.send('error');
    });

    it('should be possible to subscribe to the child process close.', function(done) {
      spy.once('phantom:close', function(data) {
        assert(data.code === 0);
        done();
      });

      spy.messenger.send('close');
    });

    after(function() {
      spy.kill();
    });
  });
});
