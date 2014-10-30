var assert = require('assert'),
    helpers = require('../shared/helpers.js');

describe('helpers', function() {

  describe('camelToHyphen', function() {

    it('should work as stated.', function() {

      assert.strictEqual(
        'local-storage-path',
        helpers.camelToHyphen('localStoragePath')
      );
    });
  });

  describe('toCLIArgs', function() {

    it('should be able to convert an object of parameters into command line arguments.', function() {

      assert.deepEqual(
        helpers.toCLIArgs({storagePath: 'ok', randomOption: true}),
        ['--storage-path="ok"', '--random-option="true"']
      );
    });
  });

  describe('range', function() {

    it('should properly create ranges.', function() {
      assert.deepEqual(helpers.range(2), [0, 1]);
      assert.deepEqual(helpers.range(4), [0, 1, 2, 3]);
    });
  });
});
