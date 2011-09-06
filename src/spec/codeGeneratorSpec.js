var cg = require('../lib/codeGenerator');
var MemoryStream = require('./memorystream').MemoryStream;
var assert = require('assert');
require('cupoftea');

spec('code generator', function () {
  var generatesExpression = function (term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScript(stream);
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  var generatesStatement = function (term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScriptStatement(stream);
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  spec('variable', function () {
    spec('with one identifier', function () {
      generatesExpression(cg.variable(['one']), 'one');
    });
    
    spec('with two identifiers', function () {
      generatesExpression(cg.variable(['one', 'two']), 'oneTwo');
    });
  });
  
  spec('function call', function () {
    spec('with no arguments', function () {
      var f = cg.functionCall(cg.variable(['f']), []);
      
      generatesExpression(f, 'f()');
    });
    
    spec('with two arguments', function () {
      var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b'])]);
      
      generatesExpression(f, 'f(a,b)');
    });
  });
  
  spec('block', function () {
    spec('with no parameters', function () {
      var b = cg.block([], cg.statements([cg.variable(['x'])]));
      
      generatesExpression(b, 'function(){return x;}');
    });
    
    spec('with two parameters', function () {
      var b = cg.block([cg.parameter(['x'])], cg.statements([cg.variable(['x'])]));
      
      generatesExpression(b, 'function(x){return x;}');
    });
  });
  
  spec('statements', function () {
    spec('with two statements', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.integer(9)), cg.functionCall(cg.variable(['two']), [])]);
      
      generatesExpression(st, 'var one=9;two();');
    });
  });
  
  spec('definition', function () {
    spec('as expression', function () {
      var d = cg.definition(cg.variable(['one']), cg.integer(9));
      
      generatesExpression(d, 'one=9');
    });
    
    spec('as statement', function () {
      var d = cg.definition(cg.variable(['one']), cg.integer(9));
      
      generatesStatement(d, 'var one=9');
    });
  });
});