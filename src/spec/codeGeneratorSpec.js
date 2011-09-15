var cg = require('../lib/codeGenerator');
var MemoryStream = require('../lib/memorystream').MemoryStream;
var assert = require('assert');
var _ = require('underscore');
require('cupoftea');

spec('code generator', function () {
  var generatesExpression = function (term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScript(stream, new cg.Scope());
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
    
    spec('with no statements', function () {
      var b = cg.block([], cg.statements([]));
      
      generatesExpression(b, 'function(){}');
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
    spec('with no statements', function () {
      var st = cg.statements([]);
      
      generatesExpression(st, '');
    });
    
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
  
  spec('if', function () {
    spec('if statement', function () {
      var m = cg.statements([cg.ifExpression(cg.variable(['obj']), cg.statements([cg.variable(['stuff'])]))]);
    
      generatesExpression(m, 'if(obj){stuff;}');
    });
  
    spec('if expression', function () {
      var m = cg.ifExpression(cg.variable(['obj']), cg.statements([cg.variable(['stuff'])]));
    
      generatesExpression(m, '(function(){if(obj){return stuff;}})()');
    });
  
    spec('if else statement', function () {
      var m = cg.statements([cg.ifExpression(
        cg.variable(['obj']),
        cg.statements([cg.variable(['stuff'])]),
        cg.statements([cg.variable(['other', 'stuff'])])
      )]);
    
      generatesExpression(m, 'if(obj){stuff;}else{otherStuff;}');
    });
  
    spec('if else expression', function () {
      var m = cg.ifExpression(cg.variable(['obj']), cg.statements([cg.variable(['stuff'])]), cg.statements([cg.variable(['other', 'stuff'])]));
    
      generatesExpression(m, '(function(){if(obj){return stuff;}else{return otherStuff;}})()');
    });
  });
  
  spec('list', function() {
    spec('with one element', function() {
      var l = cg.list([cg.variable(['stuff'])]);
      generatesExpression(l, '[stuff]');
    });
    
    spec('with two elements', function() {
      var l = cg.list([cg.variable(['stuff']), cg.variable(['more', 'stuff'])]);
      generatesExpression(l, '[stuff,moreStuff]');
    });
    
    spec('with no elements', function() {
      var l = cg.list([]);
      generatesExpression(l, '[]');
    });
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
  });
  
  spec('scope', function () {
    spec('variable defined in outer scope, assigned to in inner scope', function () {
      var s = cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.functionCall(cg.variable(['f']), [cg.block([], cg.statements([
          cg.definition(cg.variable(['x']), cg.integer(2)),
          cg.variable(['x'])
        ]))])
      ]);
      
      generatesExpression(s, 'var x;x=1;f(function(){x=2;return x;});');
    });
  });
  
  spec('module', function () {
    spec('module should be wrapped in function', function () {
      var s = cg.module(cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.functionCall(cg.variable(['f']), [cg.block([], cg.statements([
          cg.definition(cg.variable(['x']), cg.integer(2)),
          cg.variable(['x'])
        ]))])
      ]));
      
      generatesExpression(s, '(function(){var x;x=1;return f(function(){x=2;return x;});})()');
    });
  });
  
  spec('macro directory', function() {
    spec('one macro', function() {
      var md = new cg.MacroDirectory();
      md.addMacro(['one'], 1);
      assert.equal(md.findMacro(['one']), 1);
    });
    
    spec('finds correct macro among two', function() {
      var md = new cg.MacroDirectory();
      md.addMacro(['one'], 1);
      md.addMacro(['one', 'two'], 2);
      assert.equal(md.findMacro(['one', 'two']), 2);
    });
    
    spec('adding same macro overwrites previous', function() {
      var md = new cg.MacroDirectory();
      md.addMacro(['one', 'two'], 2);
      md.addMacro(['one', 'two'], 3);
      assert.equal(md.findMacro(['one', 'two']), 3);
    });
  });
});