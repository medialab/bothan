var assert = require('assert'),
    helpers = require('../shared/helpers.js');


describe('camelToHyphen', function() {

  it('should work as stated.', function() {

    assert.strictEqual(
      'local-storage-path',
      helpers.camelToHyphen('localStoragePath')
    );
  });
});
