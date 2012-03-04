var cg = require('../lib/codeGenerator');
var MemoryStream = require('../lib/memorystream').MemoryStream;
var assert = require('assert');
var _ = require('underscore');
require('cupoftea');

var shouldContainFields = require('./containsFields.js').containsFields;

spec('code generator', function () {
  var generatesExpression = function (term, expectedGeneratedCode, print) {
    var stream = new MemoryStream();
    term.generateJavaScript(stream, new cg.Scope());
    var code = stream.toString();
    if (print) {
      console.log(code);
    }
    assert.equal(code, expectedGeneratedCode);
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
  
  var generatesStatements = function(term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScriptStatements(stream, new cg.Scope());
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  var generatesStatementsReturn = function(term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScriptStatementsReturn(stream, new cg.Scope());
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
    
    spec('splats', function () {
      spec('just splat', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['b']), cg.splat()]);
      
        generatesExpression(f, 'f.apply(null,b)');
      });
      
      spec('args before', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b']), cg.splat()]);
      
        generatesExpression(f, 'f.apply(null,[a].concat(b))');
      });
      
      spec('args after', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.splat(), cg.variable(['b'])]);
      
        generatesExpression(f, 'f.apply(null,a.concat([b]))');
      });
      
      spec('two splats', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b']), cg.splat(), cg.variable(['c']), cg.variable(['d']), cg.splat(), cg.variable(['e'])]);
      
        generatesExpression(f, 'f.apply(null,[a].concat(b).concat([c]).concat(d).concat([e]))');
      });

      spec('splat with optional args', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['b']), cg.splat()], [cg.hashEntry(['port'], cg.variable(['p']))]);
      
        generatesExpression(f, 'f.apply(null,b.concat([{port:p}]))');
      });
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
    
    spec('with newline', function() {
      var s = cg.string("one\ntwo");
      
      generatesExpression(s, "'one\\ntwo'");
    });
    
    spec('with escaped single quote', function() {
      var s = cg.string("his name was 'Sue'. weird");
      
      generatesExpression(s, "'his name was \\'Sue\\'. weird'");
    });
    
    spec('normaliseString', function () {
      spec('simple', function () {
        var s = cg.normaliseString("'one'");
        assert.equal(s, 'one');
      });
      
      spec('with quotes', function () {
        var s = cg.normaliseString("'it''s a ''camera''.'");
        assert.equal(s, "it's a 'camera'.");
      });
    });
  });
  
  spec('regexps', function () {
    spec('simple', function () {
      var r = cg.regExp({pattern: 'abc'});
    
      generatesExpression(r, "/abc/");
    });
    
    spec('with options', function () {
      var r = cg.regExp({pattern: 'abc', options: 'gim'});
    
      generatesExpression(r, "/abc/gim");
    });
    
    spec('containing /', function () {
      var r = cg.regExp({pattern: 'https://', options: 'gim'});
    
      generatesExpression(r, "/https:\\/\\//gim");
    });
  });

  spec('interpolated strings', function () {
    spec('one string', function () {
      var s = cg.interpolatedString([cg.string("a string")]);

      generatesExpression(s, "'a string'");
    });

    spec('two strings', function () {
      var s = cg.interpolatedString([cg.string("a "), cg.string("string")]);

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
    spec('scopify', function () {
      spec('without parameters', function () {
        var b = cg.block([], cg.statements([cg.variable(['a'])]));
        
        var scopifiedBlock = b.scopify();
        shouldContainFields(scopifiedBlock, {
          isFunctionCall: true,
          arguments: []
        });
        assert.equal(scopifiedBlock.function, b);
      });
      
      spec('with parameters', function () {
        var b = cg.block([cg.parameters([cg.variable(['a'])])], cg.statements([cg.variable(['a'])]));
        assert.equal(b.scopify(), b);
      });
    });
    
    spec('with no parameters', function () {
      var b = cg.block([], cg.statements([cg.variable(['x'])]));
      
      generatesExpression(b, 'function(){return x;}');
    });
    
    spec('with no statements', function () {
      var b = cg.block([], cg.statements([]));
      
      generatesExpression(b, 'function(){}');
    });
    
    spec('with two parameters', function () {
      var b = cg.block([cg.variable(['x']), cg.variable(['y'])], cg.statements([cg.variable(['x'])]));
      
      generatesExpression(b, 'function(x,y){return x;}');
    });
    
    spec('with two parameters and two statements', function () {
      var b = cg.block([cg.variable(['x']), cg.variable(['y'])], cg.statements([cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]), cg.variable(['x'])]));
      
      generatesExpression(b, 'function(x,y){y(x);return x;}');
    });
    
    spec('block with new context', function () {
      var b = cg.block(
        [
          cg.variable(['x']),
          cg.variable(['y'])
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
          cg.variable(['x']),
          cg.variable(['y'])
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
    
    spec('with splat parameters', function () {
      var b = cg.block(
        [
          cg.variable(['x']),
          cg.variable(['y']),
          cg.splat(),
          cg.variable(['z'])
        ],
        cg.statements([
          cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]),
          cg.variable(['z'])
        ])
      );

      generatesExpression(b, "function(x){var y,z;y=Array.prototype.slice.call(arguments, 1, arguments.length - 1);z=arguments[arguments.length - 1];y(x);return z;}");
    });
  });
  
  spec('statements', function () {
    spec('with no statements', function () {
      var st = cg.statements([]);
      
      generatesStatements(st, '');
    });
    
    spec('with two statements', function () {
      var st = cg.statements([cg.variable(['one']), cg.functionCall(cg.variable(['two']), [])]);
      
      generatesStatements(st, 'one;two();');
    });
    
    spec('with two statements and a definition', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.integer(9)), cg.functionCall(cg.variable(['two']), [])]);
      
      generatesStatements(st, 'var one;one=9;two();');
    });
    
    spec('returning a definition', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.integer(9))]);
      
      generatesStatementsReturn(st, 'var one;return one=9;');
    });
    
    spec('chained definitions', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.definition(cg.variable(['two']), cg.integer(9)))]);
      
      generatesStatementsReturn(st, 'var one,two;return one=two=9;');
    });
    
    spec('with two definitions of the same variable', function () {
      var st = cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.definition(cg.variable(['x']), cg.integer(2)),
        cg.functionCall(cg.variable(['f']), [cg.variable(['x'])])
      ]);
      
      generatesStatements(st, 'var x;x=1;x=2;f(x);');
    });
  });
  
  spec('definition', function () {
    spec('as expression', function () {
      var d = cg.definition(cg.variable(['one']), cg.integer(9));
      
      generatesExpression(d, 'one=9');
    });
    
    spec('as hash entry', function () {
      var d = cg.hash([cg.definition(cg.variable(['one']), cg.integer(9)).hashEntry()]);
      
      generatesExpression(d, '{one:9}');
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
    var f = cg.statements([cg.forEach(cg.variable(['items']), cg.variable(['item']), cg.statements([cg.variable(['item'])]))]);
    
    generatesStatements(f, 'var gen1_items,gen2_i,item;gen1_items=items;for(gen2_i=0;(gen2_i<gen1_items.length);gen2_i++){item=gen1_items[gen2_i];item;}');
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
    
    generatesStatement(w, 'while(c){s;}');
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

    spec('splats', function () {
      spec('just splat', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['b']), cg.splat()])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,b);');
      });
      
      spec('splat call as expression', function () {
        var f = cg.statements([cg.functionCall(cg.variable(['f']), [cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['b']), cg.splat()])])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;f(gen1_o.m.apply(gen1_o,b));');
      });
      
      spec('splat call as expression for return', function () {
        var f = cg.statements([cg.functionCall(cg.variable(['f']), [cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['b']), cg.splat()])])]);
      
        generatesStatementsReturn(f, 'var gen1_o;gen1_o=o;return f(gen1_o.m.apply(gen1_o,b));');
      });
      
      spec('args before', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['a']), cg.variable(['b']), cg.splat()])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,[a].concat(b));');
      });
      
      spec('args after', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['a']), cg.splat(), cg.variable(['b'])])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,a.concat([b]));');
      });
      
      spec('two splats', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['a']), cg.variable(['b']), cg.splat(), cg.variable(['c']), cg.variable(['d']), cg.splat(), cg.variable(['e'])])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,[a].concat(b).concat([c]).concat(d).concat([e]));');
      });

      spec('splat with optional args', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['b']), cg.splat()], [cg.hashEntry(['port'], cg.variable(['p']))])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,b.concat([{port:p}]));');
      });
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
    
      generatesStatements(m, 'if(obj){stuff;}');
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
    
      generatesStatements(m, 'if(xOk){x;}else if(yOk){y;}else{otherStuff;}');
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
    
      generatesStatements(m, 'if(obj){stuff;}else{otherStuff;}');
    });
  
    spec('if else expression', function () {
      var m = cg.ifCases([{condition: cg.variable(['obj']), action: cg.statements([cg.variable(['stuff'])])}], cg.statements([cg.variable(['other', 'stuff'])]));
    
      generatesExpression(m, '(function(){if(obj){return stuff;}else{return otherStuff;}})()');
    });
  });

  spec('try', function () {
    spec('try catch', function () {
      var t = cg.tryStatement(
        cg.statements([cg.variable(['a'])]),
        cg.block(
          [cg.variable(['ex'])],
          cg.statements([cg.variable(['b'])])
        )
      );

      generatesExpression(t, 'try{a;}catch(ex){b;}');
    });

    spec("try catch is never returned", function () {
      var t = cg.tryStatement(
        cg.statements([cg.variable(['a'])]),
        cg.block(
          [cg.variable(['ex'])],
          cg.statements([cg.variable(['b'])])
        )
      );

      generatesReturnExpression(t, 'try{a;}catch(ex){b;}');
    });

    spec('try catch finally', function () {
      var t = cg.tryStatement(
        cg.statements([cg.variable(['a'])]),
        cg.block(
          [cg.variable(['ex'])],
          cg.statements([cg.variable(['b'])])
        ),
        cg.statements([cg.variable(['c'])])
      );

      generatesExpression(t, 'try{a;}catch(ex){b;}finally{c;}');
    });

    spec('try finally', function () {
      var t = cg.tryStatement(
        cg.statements([cg.variable(['a'])]),
        undefined,
        cg.statements([cg.variable(['b'])])
      );

      generatesExpression(t, 'try{a;}finally{b;}');
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
  
  spec('symbol scope', function () {
    spec('variable defined in outer scope, assigned to in inner scope', function () {
      var s = cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.functionCall(cg.variable(['f']), [cg.block([], cg.statements([
          cg.definition(cg.variable(['x']), cg.integer(2)),
          cg.variable(['x'])
        ]))])
      ]);
      
      generatesStatements(s, 'var x;x=1;f(function(){x=2;return x;});');
    });
  });
  
  spec('scope', function () {
    spec('places scope contents inside a function which is called immediately', function () {
      var s = cg.scope([cg.definition(cg.variable(['a']), cg.integer(8)), cg.variable(['a'])]);
      
      generatesExpression(s, '(function(){var a;a=8;return a;})()');
    })
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
      
      generatesExpression(s, '(function(){var self,x;self=this;x=1;f(function(){x=2;return x;});}).call(this);');
    });

    spec('module should not be wrapped in function if in scope is false', function () {
      var s = cg.module(cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.functionCall(cg.variable(['f']), [cg.block([], cg.statements([
          cg.definition(cg.variable(['x']), cg.integer(2)),
          cg.variable(['x'])
        ]))])
      ]));

      s.inScope = false;
      
      generatesExpression(s, 'var x;x=1;f(function(){x=2;return x;});');
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
  
  spec('roll', function () {
    var list = [1, "a", "b", 3, "4", "5"];
    
    var collapsedList = cg.collapse(list, function (item) {
      if (typeof item == 'string')
        return item;
    }, function (group, item) {
      if (typeof item == 'string')
        return group + item;
    }, function (group) {
      return "~" + group;
    });
    
    shouldContainFields(collapsedList, [1, '~ab', 3, '~45']);
  });
  
  spec('parseSplatParameters', function () {
    spec('no splat', function () {
      var splat = cg.parseSplatParameters([cg.variable(['a'])]);
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: undefined,
        lastParameters: []
      });
    });
    
    spec('only splat', function () {
      var splat = cg.parseSplatParameters([
        cg.variable(['a']),
        cg.splat()
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [],
        splatParameter: {variable: ['a']},
        lastParameters: []
      });
    });
    
    spec('splat start', function () {
      var splat = cg.parseSplatParameters([
        cg.variable(['a']),
        cg.splat(),
        cg.variable(['b'])
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [],
        splatParameter: {variable: ['a']},
        lastParameters: [{variable: ['b']}]
      });
    });
    
    spec('splat end', function () {
      var splat = cg.parseSplatParameters([
        cg.variable(['a']),
        cg.variable(['b']),
        cg.splat()
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: {variable: ['b']},
        lastParameters: []
      });
    });
    
    spec('splat middle', function () {
      var splat = cg.parseSplatParameters([
        cg.variable(['a']),
        cg.variable(['b']),
        cg.splat(),
        cg.variable(['c'])
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: {variable: ['b']},
        lastParameters: [{variable: ['c']}]
      });
    });
    
    spec('two splats', function () {
      var secondSplat = cg.splat();
      secondSplat.secondSplat = true;
      
      var splat = cg.parseSplatParameters([
        cg.variable(['a']),
        cg.variable(['b']),
        cg.splat(),
        cg.variable(['c']),
        secondSplat,
        cg.variable(['d'])
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: {variable: ['b']},
        lastParameters: [
          {variable: ['c']},
          {variable: ['d']}
        ]
      });
    });
  });
});
