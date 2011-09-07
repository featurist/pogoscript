var cg = require('../lib/codeGenerator');
var MemoryStream = require('./memorystream').MemoryStream;
var assert = require('assert');
var _ = require('underscore');
require('cupoftea');

spec('code generator', function () {
  var generatesExpression = function (term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScript(stream);
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
      var b = cg.block([cg.parameter(['x']), cg.parameter(['y'])], cg.statements([cg.variable(['x'])]));
      
      generatesExpression(b, 'function(x,y){return x;}');
    });
    
    spec('with two parameters and two statements', function () {
      var b = cg.block([cg.parameter(['x']), cg.parameter(['y'])], cg.statements([cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]), cg.variable(['x'])]));
      
      generatesExpression(b, 'function(x,y){y(x);return x;}');
    });
  });
  
  spec('statements', function () {
    spec('with two statements', function () {
      var st = cg.statements([cg.variable(['one']), cg.functionCall(cg.variable(['two']), [])]);
      
      generatesExpression(st, 'one;two();');
    });
    
    spec('with two statements and a definition', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.integer(9)), cg.functionCall(cg.variable(['two']), [])]);
      
      generatesExpression(st, 'var one;one=9;two();');
    });
    
    spec('with two definitions of the same variable', function () {
      var st = cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.definition(cg.variable(['x']), cg.integer(2)),
        cg.functionCall(cg.variable(['f']), [cg.variable(['x'])])
      ]);
      
      generatesExpression(st, 'var x;x=1;x=2;f(x);');
    });
  });
  
  spec('definition', function () {
    spec('as expression', function () {
      var d = cg.definition(cg.variable(['one']), cg.integer(9));
      
      generatesExpression(d, 'one=9');
    });
  });
  
  spec('method call', function () {
    var m = cg.methodCall(cg.variable(['console']), ['log'], [cg.variable(['stuff'])]);
    
    generatesExpression(m, 'console.log(stuff)');
  });
  
  spec('indexer', function () {
    var m = cg.indexer(cg.variable(['array']), cg.variable(['stuff']));
    
    generatesExpression(m, 'array[stuff]');
  });
  
  spec('field reference', function () {
    var m = cg.fieldReference(cg.variable(['obj']), ['field', 'name']);
    
    generatesExpression(m, 'obj.fieldName');
  });
  
  spec('walkTerm', function () {
    var object = cg.variable(['console']);
    var argument = cg.variable(['stuff']);
    var m = cg.methodCall(object, ['log'], [argument]);
    
    var walkedTerms = [];
    
    m.walk(function (subterm) {
      walkedTerms.push(subterm);
    });
    
    assert.ok(_(walkedTerms).contains(object));
    assert.ok(_(walkedTerms).contains(argument));
    assert.ok(_(walkedTerms).contains(m));
  })
});