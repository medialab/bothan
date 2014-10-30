var assert = require('assert'),
    spawn = require('../src/spawn.js'),
    bothan = require('../index.js'),
    spynet = require('../src/spynet.js'),
    async = require('async');

describe('spawn', function() {

  describe('error handling', function() {

    it('should return an error when handshake took too long.', function(done) {
      spawn({handshakeTimeout: 10}, function(err) {
        assert.strictEqual(err.message, 'handshake-timeout');
        done();
      });
    });

    it('should return an error when trying to listen on a unavailable port.', function(done) {
      spynet.close();
      bothan.config({port: 80});
      spawn(function(err) {
        assert.strictEqual(err.message, 'unavailable-port');
        bothan.config({port: 8074});
        done();
      });
    });
  });

  describe('basic cases', function() {
    it('should be able to spawn a simple phantom.', function(done) {
      spawn({name: 'simple'}, function(err, spy) {
        assert(!err);
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

  describe('parallel', function() {

    it('should be possible to spawn several phantoms at the same time.', function(done) {
      async.parallel([
        function (next) {
          spawn({name: 'one'}, function(err, spy) {
            assert.strictEqual(spy.name, 'one');
            assert(!err);
            setTimeout(function() {
              spy.kill();
              next();
            }, 100);
          });
        },
        function (next) {
          spawn({name: 'two'}, function(err, spy) {
            assert.strictEqual(spy.name, 'two');
            assert(!err);
            setTimeout(function() {
              spy.kill();
              next();
            }, 100);
          });
        }
      ], done);
    });
  });
});
