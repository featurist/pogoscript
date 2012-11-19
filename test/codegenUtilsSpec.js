var codegenUtils = require('../lib/terms/codegenUtils');
var assert = require('assert');

describe('codegen utils', function () {
  describe('concatName', function () {
    it('one identifier', function () {
      assert.equal(codegenUtils.concatName(['one']), 'one');
    });
    
    it('two identifiers', function () {
      assert.equal(codegenUtils.concatName(['one', 'two']), 'oneTwo');
    });
    
    it('explicit case', function () {
      assert.equal(codegenUtils.concatName(['One', 'Two']), 'OneTwo');
    });
    
    it('underscores', function () {
      assert.equal(codegenUtils.concatName(['_one', '_two']), '_one_two');
    });
    
    it('operators', function () {
      assert.equal(codegenUtils.concatName(['+*']), '$2b$2a');
    });
    
    it('escapes reserved words when escape is true', function () {
      assert.equal(codegenUtils.concatName(['class'], {escape: true}), '$class');
    });
    
    it("doesn't escape reserved words when escape isn't true", function () {
      assert.equal(codegenUtils.concatName(['class']), 'class');
    });
  });
});
