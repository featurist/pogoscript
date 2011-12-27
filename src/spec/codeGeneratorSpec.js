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
  
  var generatesReturnExpression = function(term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScriptReturn(stream, new cg.Scope());
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  var generatesStatement = function(term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScriptStatement(stream, new cg.Scope());
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  spec('concatName', function () {
    spec('one identifier', function () {
      assert.equal(cg.concatName(['one']), 'one');
    });
    
    spec('two identifiers', function () {
      assert.equal(cg.concatName(['one', 'two']), 'oneTwo');
    });
    
    spec('explicit case', function () {
      assert.equal(cg.concatName(['One', 'Two']), 'OneTwo');
    });
    
    spec('underscores', function () {
      assert.equal(cg.concatName(['_one', '_two']), '_one_two');
    });
    
    spec('operators', function () {
      assert.equal(cg.concatName(['+*']), '$2b$2a');
    });
  });
  
  spec('variable', function () {
    spec('with one identifier', function () {
      generatesExpression(cg.variable(['one']), 'one');
    });
    
    spec('with two identifiers', function () {
      generatesExpression(cg.variable(['one', 'two']), 'oneTwo');
    });
    
    spec('with capitalised word', function () {
      generatesExpression(cg.variable(['Stack']), 'Stack');
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
    
    spec('with no arguments and an optional argument', function () {
      var f = cg.functionCall(cg.variable(['f']), [], [cg.hashEntry(['port'], cg.variable(['p']))]);
      
      generatesExpression(f, 'f({port:p})');
    });
    
    spec('with an argument and two optional arguments', function () {
      var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a'])],
        [
          cg.hashEntry(['port'], cg.variable(['p'])),
          cg.hashEntry(['server'], cg.variable(['s'])),
          cg.hashEntry(['start'])
        ]);
      
      generatesExpression(f, 'f(a,{port:p,server:s,start:true})');
    });
  });
  
  spec('string', function() {
    spec('normal', function() {
      var s = cg.string("a string");
      
      generatesExpression(s, "'a string'");
    });
    spec('with escaped single quote', function() {
      var s = cg.string("his name was 'Sue'. weird");
      
      generatesExpression(s, "'his name was \\'Sue\\'. weird'");
    });
  });

  spec('interpolated strings', function () {
    spec('one string', function () {
      var s = cg.interpolatedString([cg.string("a string")]);

      generatesExpression(s, "'a string'");
    });

    spec('two expressions', function () {
      var s = cg.interpolatedString([cg.variable(['x']), cg.variable(['y'])]);

      generatesExpression(s, "x+''+y");
    });

    spec('expression in string', function () {
      var s = cg.interpolatedString([cg.string("before "), cg.variable(['x']), cg.string(' after')]);

      generatesExpression(s, "'before '+x+' after'");
    });
  });
  
  spec('operators', function () {
    spec('two argument operator', function() {
      var s = cg.operator('*', [cg.variable(['a']), cg.integer(8)]);
      generatesExpression(s, "(a*8)");
    });

    spec('multiple argument operator', function() {
      var s = cg.operator('*', [cg.variable(['a']), cg.integer(8), cg.variable(['b'])]);
      generatesExpression(s, "(a*8*b)");
    });

    spec('unary operator', function() {
      var s = cg.operator('-', [cg.variable(['a'])]);
      generatesExpression(s, "(-a)");
    });
  })
  
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
    
    spec('block with new context', function () {
      var b = cg.block(
        [
          cg.parameter(['x']),
          cg.parameter(['y'])
        ],
        cg.statements([
          cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]),
          cg.variable(['x'])
        ])
      );
      
      b.redefinesSelf = true;
      
      generatesExpression(b, 'function(x,y){var self;self=this;y(x);return x;}');
    });
    
    spec('with a parameter and two optional parameters', function () {
      var b = cg.block(
        [
          cg.parameter(['x']),
          cg.parameter(['y'])
        ],
        cg.statements([
          cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]),
          cg.variable(['x'])
        ])
      );

      b.optionalParameters = [
        cg.hashEntry(['port'], cg.integer(80)),
        cg.hashEntry(['start'])
      ];
      
      generatesExpression(b, "function(x,y,gen1_options){var port,start;port=(gen1_options&&gen1_options.port!=null)?gen1_options.port:80;start=(gen1_options&&gen1_options.start!=null)?gen1_options.start:undefined;y(x);return x;}");
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
    
    spec('returning a definition', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.integer(9))]);
      
      generatesReturnExpression(st, 'var one;return one=9;');
    });
    
    spec('chained definitions', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.definition(cg.variable(['two']), cg.integer(9)))]);
      
      generatesReturnExpression(st, 'var one,two;return one=two=9;');
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
    
    spec('of field', function () {
      var d = cg.definition(cg.fieldReference(cg.variable(['object']), ['field']), cg.integer(9));
      
      generatesExpression(d, 'object.field=9');
    });
    
    spec('of index', function () {
      var d = cg.definition(cg.indexer(cg.variable(['array']), cg.integer(1)), cg.integer(9));
      
      generatesExpression(d, 'array[1]=9');
    });
  });
  
  spec('new operator', function() {
    var n = cg.newOperator(cg.functionCall(cg.variable(['Stack']), [cg.integer(8)]));
    
    generatesExpression(n, 'new Stack(8)');
  });
  
  spec('for each', function() {
    var f = cg.statements([cg.forEach(cg.variable(['items']), ['item'], cg.statements([cg.variable(['item'])]))]);
    
    generatesExpression(f, 'var gen1_items,gen2_i,item;gen1_items=items;for(gen2_i=0;(gen2_i<gen1_items.length);gen2_i++){item=gen1_items[gen2_i];item;}');
  });
  
  spec('for', function() {
    var f = cg.forStatement(
      cg.definition(cg.variable(['i']), cg.integer(0)),
      cg.operator('<', [cg.variable(['i']), cg.integer(10)]),
      cg.definition(cg.variable(['i']), cg.operator('+', [cg.variable(['i']), cg.integer(1)])),
      cg.statements([cg.variable(['i'])])
    );
    
    generatesReturnExpression(f, 'for(i=0;(i<10);i=(i+1)){i;}');
  });
  
  spec('while', function() {
    var w = cg.whileStatement(cg.variable(['c']), cg.statements([cg.variable(['s'])]));
    
    generatesReturnExpression(w, 'while(c){s;}');
  });
  
  spec('method call', function () {
    spec('method call', function () {
      var m = cg.methodCall(cg.variable(['console']), ['log'], [cg.variable(['stuff'])]);
      
      generatesExpression(m, 'console.log(stuff)');
    });

    spec('method call with optional argument', function () {
      var m = cg.methodCall(cg.variable(['console']), ['log'], [cg.variable(['stuff'])], [cg.hashEntry(['port'], cg.integer(45))]);
      
      generatesExpression(m, 'console.log(stuff,{port:45})');
    });
  });
  
  spec('indexer', function () {
    var m = cg.indexer(cg.variable(['array']), cg.variable(['stuff']));
    
    generatesExpression(m, 'array[stuff]');
  });
  
  spec('field reference', function () {
    var m = cg.fieldReference(cg.variable(['obj']), ['field', 'name']);
    
    generatesExpression(m, 'obj.fieldName');
  });
  
  spec('return', function () {
    spec('as statement', function () {
      var m = cg.returnStatement(cg.variable(['a']));
      generatesStatement(m, 'return a;');
    });
    
    spec('as return', function () {
      var m = cg.returnStatement(cg.variable(['a']));
      generatesReturnExpression(m, 'return a;');
    });
  });
  
  spec('throw', function () {
    spec('as statement', function () {
      var m = cg.throwStatement(cg.variable(['a']));
      generatesStatement(m, 'throw a;');
    });
    
    spec('as return', function () {
      var m = cg.throwStatement(cg.variable(['a']));
      generatesReturnExpression(m, 'throw a;');
    });
  });

  spec('break', function () {
    spec('as statement', function () {
      var m = cg.breakStatement(cg.variable(['a']));
      generatesStatement(m, 'break;');
    });
    
    spec('as return', function () {
      var m = cg.breakStatement(cg.variable(['a']));
      generatesReturnExpression(m, 'break;');
    });
  });

  spec('continue', function () {
    spec('as statement', function () {
      var m = cg.continueStatement(cg.variable(['a']));
      generatesStatement(m, 'continue;');
    });
    
    spec('as return', function () {
      var m = cg.continueStatement(cg.variable(['a']));
      generatesReturnExpression(m, 'continue;');
    });
  });
  
  spec('if', function () {
    spec('if statement', function () {
      var m = cg.statements([cg.ifCases([{
        condition: cg.variable(['obj']),
        action: cg.statements([cg.variable(['stuff'])])
      }])]);
    
      generatesExpression(m, 'if(obj){stuff;}');
    });
  
    spec('if else if else statement', function () {
      var m = cg.statements([cg.ifCases([{
          condition: cg.variable(['x', 'ok']),
          action: cg.statements([cg.variable(['x'])])
        },
        {
          condition: cg.variable(['y', 'ok']),
          action: cg.statements([cg.variable(['y'])])
        }],
        cg.statements([cg.variable(['other', 'stuff'])])
      )]);
    
      generatesExpression(m, 'if(xOk){x;}else if(yOk){y;}else{otherStuff;}');
    });
  
    spec('if expression', function () {
      var m = cg.ifCases([{condition: cg.variable(['obj']), action: cg.statements([cg.variable(['stuff'])])}]);
    
      generatesExpression(m, '(function(){if(obj){return stuff;}})()');
    });
  
    spec('if else statement', function () {
      var m = cg.statements([cg.ifCases([{
          condition: cg.variable(['obj']),
          action: cg.statements([cg.variable(['stuff'])])
        }],
        cg.statements([cg.variable(['other', 'stuff'])])
      )]);
    
      generatesExpression(m, 'if(obj){stuff;}else{otherStuff;}');
    });
  
    spec('if else expression', function () {
      var m = cg.ifCases([{condition: cg.variable(['obj']), action: cg.statements([cg.variable(['stuff'])])}], cg.statements([cg.variable(['other', 'stuff'])]));
    
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
  
  spec('hash', function() {
    spec('with one item', function() {
      var h = cg.hash([cg.hashEntry(['street', 'address'], cg.variable(['address']))]);
      generatesExpression(h, '{streetAddress:address}');
    });
    
    spec('with two items, one with string field', function() {
      var h = cg.hash([
        cg.hashEntry(['street', 'address'], cg.variable(['address'])),
        cg.hashEntry(['Content-Type'], cg.string('text/plain'))
      ]);
      generatesExpression(h, "{streetAddress:address,'Content-Type':'text/plain'}");
    });
    
    spec('with true item', function() {
      var h = cg.hash([
        cg.hashEntry(['street', 'address'], cg.boolean(true))
      ]);
      generatesExpression(h, "{streetAddress:true}");
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
      
      generatesExpression(s, '(function(){var self,x;self=this;x=1;f(function(){x=2;return x;});})()');
    });
  });
  
  spec('macro directory', function() {
    spec('one macro', function() {
      var md = new cg.MacroDirectory();
      md.addMacro(['one'], 1);
      assert.equal(md.findMacro(['one']), 1);
    });
    
    spec("longer name doesn't find macro with shorter name", function() {
      var md = new cg.MacroDirectory();
      md.addMacro(['one'], 1);
      assert.equal(md.findMacro(['one', 'two']), undefined);
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
    
    spec('wild card macros', function() {
      spec('wild card macro with further name requirement', function () {
        var md = new cg.MacroDirectory();

        var macro = {};

        var wild = function (name) {
          if (name.length == 3 && name[2] == 'three') {
            return macro;
          }
        };

        md.addWildCardMacro(['one', 'two'], wild);

        assert.equal(md.findMacro(['one', 'two']), undefined);
        assert.equal(md.findMacro(['one', 'two', 'three']), macro);
        assert.equal(md.findMacro(['one', 'two', 'four']), undefined);
      });
      
      spec('wild card macro with exact name', function () {
        var md = new cg.MacroDirectory();

        var macro = {};

        var wild = function (name) {
          return macro;
        };

        md.addWildCardMacro(['one', 'two'], wild);

        assert.equal(md.findMacro(['one', 'two']), macro);
      });
      
      spec('normal macros have priority over wild card macros', function () {
        var md = new cg.MacroDirectory();

        var macro = {};

        var wild = function (name) {
          if (name.length == 3 && name[2] == 'three') {
            return macro;
          }
        };

        md.addWildCardMacro(['one', 'two'], wild);
        md.addMacro(['one', 'two', 'three'], 3);

        assert.equal(md.findMacro(['one', 'two']), undefined);
        assert.equal(md.findMacro(['one', 'two', 'three']), 3);
        assert.equal(md.findMacro(['one', 'two', 'four']), undefined);
      });
    });
  });
});
