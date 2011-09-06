var cg = require('../lib/codeGenerator');
var MemoryStream = require('./memorystream').MemoryStream;
var assert = require('assert');
require('cupoftea');

spec('code generator', function () {
  var assertGenerates = function (term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScript(stream);
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  spec('variable', function () {
    spec('with one identifier', function () {
      assertGenerates(cg.variable(['one']), 'one');
    });
    
    spec('with two identifiers', function () {
      assertGenerates(cg.variable(['one', 'two']), 'oneTwo');
    });
  });
  
  spec('function call', function () {
    spec('with no arguments', function () {
      var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b'])]);
      
      assertGenerates(f, 'f(a,b)');
    });
  });
});