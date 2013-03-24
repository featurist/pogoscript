var codegenUtils = require('../lib/terms/codegenUtils');
var should = require('should');

describe('codegen utils', function () {
  describe('concatName', function () {
    it('one identifier', function () {
      should.equal(codegenUtils.concatName(['one']), 'one');
    });
    
    it('two identifiers', function () {
      should.equal(codegenUtils.concatName(['one', 'two']), 'oneTwo');
    });
    
    it('explicit case', function () {
      should.equal(codegenUtils.concatName(['One', 'Two']), 'OneTwo');
    });
    
    it('underscores', function () {
      should.equal(codegenUtils.concatName(['_one', '_two']), '_one_two');
    });
    
    it('operators', function () {
      should.equal(codegenUtils.concatName(['+*']), '$2b$2a');
    });
    
    it('escapes reserved words when escape is true', function () {
      should.equal(codegenUtils.concatName(['class'], {escape: true}), '$class');
    });
    
    it("doesn't escape reserved words when escape isn't true", function () {
      should.equal(codegenUtils.concatName(['class']), 'class');
    });
  });
});
