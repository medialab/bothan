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
});
