var cg = require('../src/bootstrap/codeGenerator/codeGenerator').codeGenerator();
var MemoryStream = require('../lib/memorystream').MemoryStream;
var assert = require('assert');
var _ = require('underscore');
require('cupoftea');

var shouldContainFields = require('./containsFields.js').containsFields;

describe('code generator', function () {
  var generatesExpression = function (term, expectedGeneratedCode, print) {
    var stream = new MemoryStream();
    term.generateJavaScript(stream, new cg.Scope());
    var code = stream.toString();
    if (print) {
      console.log(code);
    }
    assert.equal(code, expectedGeneratedCode);
  };
  
  var generatesReturnExpression = function(term, expectedGeneratedCode, print) {
    var stream = new MemoryStream();
    term.generateJavaScriptReturn(stream, new cg.Scope());
    if (print)
        console.log(stream.toString());
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  var generatesStatement = function(term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScriptStatement(stream, new cg.Scope());
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  var generatesStatements = function(term, expectedGeneratedCode, global, print) {
    var stream = new MemoryStream();
    term.generateJavaScriptStatements(stream, new cg.Scope(), global);
    if (print)
        console.log(stream.toString())
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  var generatesStatementsReturn = function(term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScriptStatementsReturn(stream, new cg.Scope());
    assert.equal(stream.toString(), expectedGeneratedCode);
  };
  
  describe('concatName', function () {
    it('one identifier', function () {
      assert.equal(cg.concatName(['one']), 'one');
    });
    
    it('two identifiers', function () {
      assert.equal(cg.concatName(['one', 'two']), 'oneTwo');
    });
    
    it('explicit case', function () {
      assert.equal(cg.concatName(['One', 'Two']), 'OneTwo');
    });
    
    it('underscores', function () {
      assert.equal(cg.concatName(['_one', '_two']), '_one_two');
    });
    
    it('operators', function () {
      assert.equal(cg.concatName(['+*']), '$2b$2a');
    });
    
    it('escapes reserved words when escape is true', function () {
      assert.equal(cg.concatName(['class'], {escape: true}), '$class');
    });
    
    it("doesn't escape reserved words when escape isn't true", function () {
      assert.equal(cg.concatName(['class']), 'class');
    });
  });
  
  describe('variable', function () {
    it('with one identifier', function () {
      generatesExpression(cg.variable(['one']), 'one');
    });
    
    it('with two identifiers', function () {
      generatesExpression(cg.variable(['one', 'two']), 'oneTwo');
    });
    
    it('with capitalised word', function () {
      generatesExpression(cg.variable(['Stack']), 'Stack');
    });
    
    it('escapes reserved word', function () {
      generatesExpression(cg.variable(['class']), '$class');
    });
    
    it("doesn't escape already escaped reserved word", function () {
      generatesExpression(cg.variable(['$class']), '$class');
    });
  });
  
  describe('function call', function () {
    it('with no arguments', function () {
      var f = cg.functionCall(cg.variable(['f']), []);
      
      generatesExpression(f, 'f()');
    });
    
    it('with two arguments', function () {
      var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b'])]);
      
      generatesExpression(f, 'f(a,b)');
    });
    
    describe('splats', function () {
      it('just splat', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['b']), cg.splat()]);
      
        generatesExpression(f, 'f.apply(null,b)');
      });
      
      it('splat with field reference method call', function () {
        var f = cg.functionCall(cg.indexer(cg.variable(['f']), cg.variable(['g'])), [cg.variable(['b']), cg.splat()]);
      
        generatesExpression(f, 'f[g].apply(f,b)');
      });
      
      it('args before', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b']), cg.splat()]);
      
        generatesExpression(f, 'f.apply(null,[a].concat(b))');
      });
      
      it('args after', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.splat(), cg.variable(['b'])]);
      
        generatesExpression(f, 'f.apply(null,a.concat([b]))');
      });
      
      it('two splats', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b']), cg.splat(), cg.variable(['c']), cg.variable(['d']), cg.splat(), cg.variable(['e'])]);
      
        generatesExpression(f, 'f.apply(null,[a].concat(b).concat([c]).concat(d).concat([e]))');
      });

      it('splat with optional args', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['b']), cg.splat()], [cg.hashEntry(['port'], cg.variable(['p']))]);
      
        generatesExpression(f, 'f.apply(null,b.concat([{port:p}]))');
      });
    });
    
    it('with no arguments and an optional argument', function () {
      var f = cg.functionCall(cg.variable(['f']), [], [cg.hashEntry(['port'], cg.variable(['p']))]);
      
      generatesExpression(f, 'f({port:p})');
    });
    
    it('with an argument and two optional arguments', function () {
      var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a'])],
        [
          cg.hashEntry(['port'], cg.variable(['p'])),
          cg.hashEntry(['server'], cg.variable(['s'])),
          cg.hashEntry(['start'])
        ]);
      
      generatesExpression(f, 'f(a,{port:p,server:s,start:true})');
    });
  });
  
  describe('string', function() {
    it('normal', function() {
      var s = cg.string("a string");
      
      generatesExpression(s, "'a string'");
    });
    
    it('with newline', function() {
      var s = cg.string("one\ntwo");
      
      generatesExpression(s, "'one\\ntwo'");
    });
    
    it('with escaped single quote', function() {
      var s = cg.string("his name was 'Sue'. weird");
      
      generatesExpression(s, "'his name was \\'Sue\\'. weird'");
    });
  });
  
  describe('regexps', function () {
    it('simple', function () {
      var r = cg.regExp({pattern: 'abc'});
    
      generatesExpression(r, "/abc/");
    });
    
    it('with options', function () {
      var r = cg.regExp({pattern: 'abc', options: 'gim'});
    
      generatesExpression(r, "/abc/gim");
    });
    
    it('containing /', function () {
      var r = cg.regExp({pattern: 'https://', options: 'gim'});
    
      generatesExpression(r, "/https:\\/\\//gim");
    });
  });

  describe('interpolated strings', function () {
    it('one string', function () {
      var s = cg.interpolatedString([cg.string("a string")]);

      generatesExpression(s, "'a string'");
    });

    it('two strings', function () {
      var s = cg.interpolatedString([cg.string("a "), cg.string("string")]);

      generatesExpression(s, "'a string'");
    });

    it('two expressions', function () {
      var s = cg.interpolatedString([cg.variable(['x']), cg.variable(['y'])]);

      generatesExpression(s, "x+''+y");
    });

    it('expression in string', function () {
      var s = cg.interpolatedString([cg.string("before "), cg.variable(['x']), cg.string(' after')]);

      generatesExpression(s, "'before '+x+' after'");
    });
  });
  
  describe('operators', function () {
    it('two argument operator', function() {
      var s = cg.operator('*', [cg.variable(['a']), cg.integer(8)]);
      generatesExpression(s, "(a*8)");
    });

    it('multiple argument operator', function() {
      var s = cg.operator('*', [cg.variable(['a']), cg.integer(8), cg.variable(['b'])]);
      generatesExpression(s, "(a*8*b)");
    });

    it('unary operator', function() {
      var s = cg.operator('-', [cg.variable(['a'])]);
      generatesExpression(s, "(-a)");
    });

    it('unary alpha operator generates spaces around operator', function() {
      var s = cg.operator('instanceof', [cg.variable(['a'])]);
      generatesExpression(s, "(instanceof a)");
    });

    it('alpha operator generates spaces around operator', function() {
      var s = cg.operator('instanceof', [cg.variable(['a']), cg.variable(['b'])]);
      generatesExpression(s, "(a instanceof b)");
    });
  })
  
  describe('block', function () {
    describe('scopify', function () {
      it('without parameters', function () {
        var b = cg.block([], cg.statements([cg.variable(['a'])]));
        
        var scopifiedBlock = b.scopify();
        shouldContainFields(scopifiedBlock, {
          isScope: true,
          statements: [{
            isVariable: true,
            variable: ['a']
          }]
        });
      });
      
      it('with parameters', function () {
        var b = cg.block([cg.parameters([cg.variable(['a'])])], cg.statements([cg.variable(['a'])]));
        assert.equal(b.scopify(), b);
      });
    });
    
    it('with no parameters', function () {
      var b = cg.block([], cg.statements([cg.variable(['x'])]));
      
      generatesExpression(b, 'function(){return x;}');
    });
    
    it('with no statements', function () {
      var b = cg.block([], cg.statements([]));
      
      generatesExpression(b, 'function(){}');
    });
    
    it('declares its parameters', function () {
      var b = cg.block([cg.variable(['x'])], cg.statements([cg.definition(cg.variable(['x']), cg.integer(8))]));
      
      generatesExpression(b, 'function(x){return x=8;}');
    });
    
    it('with two parameters', function () {
      var b = cg.block([cg.variable(['x']), cg.variable(['y'])], cg.statements([cg.variable(['x'])]));
      
      generatesExpression(b, 'function(x,y){return x;}');
    });
    
    it('with two parameters and two statements', function () {
      var b = cg.block([cg.variable(['x']), cg.variable(['y'])], cg.statements([cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]), cg.variable(['x'])]));
      
      generatesExpression(b, 'function(x,y){y(x);return x;}');
    });
    
    it('block with new context', function () {
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
    
    it('with a parameter and two optional parameters', function () {
      var b;
      var s = cg.statements([
        cg.definition(cg.variable(['port']), cg.integer(1)),
        b = cg.block(
          [
            cg.variable(['x']),
            cg.variable(['y'])
          ],
          cg.statements([
            cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]),
            cg.variable(['x'])
          ])
        )
      ]);

      b.optionalParameters = [
        cg.hashEntry(['port'], cg.integer(80)),
        cg.hashEntry(['start'])
      ];
      
      generatesStatements(s, "var port;port=1;function(x,y,gen1_options){var port,start;port=(gen1_options&&gen1_options.hasOwnProperty('port')&&gen1_options.port!==void 0)?gen1_options.port:80;start=(gen1_options&&gen1_options.hasOwnProperty('start')&&gen1_options.start!==void 0)?gen1_options.start:undefined;y(x);return x;};");
    });
    
    it('with splat parameters', function () {
      var s = cg.statements([
        cg.definition(cg.variable(['y']), cg.integer(1)),
        cg.block(
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
        )
      ]);

      generatesStatements(s, "var y;y=1;function(x){var y,z;y=Array.prototype.slice.call(arguments, 1, arguments.length - 1);z=arguments[arguments.length - 1];y(x);return z;};");
    });
  });
  
  describe('statements', function () {
    it('with no statements', function () {
      var st = cg.statements([]);
      
      generatesStatements(st, '');
    });
    
    it('with two statements', function () {
      var st = cg.statements([cg.variable(['one']), cg.functionCall(cg.variable(['two']), [])]);
      
      generatesStatements(st, 'one;two();');
    });
    
    it('with two statements and a definition', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.integer(9)), cg.functionCall(cg.variable(['two']), [])]);
      
      generatesStatements(st, 'var one;one=9;two();');
    });
    
    it('returning a definition', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.integer(9))]);
      
      generatesStatementsReturn(st, 'var one;return one=9;');
    });

    it("when global is true, doesn't generate 'vars' for variables", function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.integer(9))]);
      
      generatesStatements(st, 'one=9;', true);
    });
    
    it('chained definitions', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.definition(cg.variable(['two']), cg.integer(9)))]);
      
      generatesStatementsReturn(st, 'var one,two;return one=two=9;');
    });
    
    it('generates sub statements', function () {
      var st = cg.statements([cg.statements([cg.variable(['one']), cg.variable(['two'])], {expression: true})]);
      
      generatesStatementsReturn(st, 'one;return two;');
    });
    
    it('generates sub statements, but not in blocks', function () {
      var st = cg.statements([cg.block([], cg.statements([cg.statements([cg.variable(['one']), cg.variable(['two'])], {expression: true})]))]);
      
      generatesStatementsReturn(st, 'return function(){one;return two;};');
    });
    
    it('with two definitions of the same variable', function () {
      var st = cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.definition(cg.variable(['x']), cg.integer(2)),
        cg.functionCall(cg.variable(['f']), [cg.variable(['x'])])
      ]);
      
      generatesStatements(st, 'var x;x=1;x=2;f(x);');
    });
  });
  
  describe('definition', function () {
    it('as expression', function () {
      var d = cg.definition(cg.variable(['one']), cg.integer(9));
      
      generatesExpression(d, 'one=9');
    });
    
    it('as hash entry', function () {
      var d = cg.hash([cg.definition(cg.variable(['one']), cg.integer(9)).hashEntry()]);
      
      generatesExpression(d, '{one:9}');
    });
    
    it('of field', function () {
      var d = cg.definition(cg.fieldReference(cg.variable(['object']), ['field']), cg.integer(9));
      
      generatesExpression(d, 'object.field=9');
    });
    
    it('of reserved word field', function () {
      var d = cg.definition(cg.fieldReference(cg.variable(['object']), ['class']), cg.integer(9));
      
      generatesExpression(d, 'object.class=9');
    });
    
    it('of index', function () {
      var d = cg.definition(cg.indexer(cg.variable(['array']), cg.integer(1)), cg.integer(9));
      
      generatesExpression(d, 'array[1]=9');
    });
  });
  
  describe('new operator', function() {
    it('gnerates js new for function call', function() {
      var n = cg.newOperator(cg.functionCall(cg.variable(['Stack']), [cg.integer(8)]));
    
      generatesExpression(n, 'new Stack(8)');
    });
    
    it('gnerates js new for variable', function() {
      var n = cg.newOperator(cg.variable(['Stack']));
    
      generatesExpression(n, 'new Stack()');
    });
  });
  
  it('for each', function() {
    var f = cg.statements([cg.forEach(cg.variable(['items']), cg.variable(['item']), cg.statements([cg.variable(['item'])]))]);
    
    generatesStatements(f, 'var gen1_items,gen2_i;gen1_items=items;for(gen2_i=0;(gen2_i<gen1_items.length);gen2_i++){var gen3_forResult;gen3_forResult=void 0;if((function(gen2_i){var item;item=gen1_items[gen2_i];item;}(gen2_i))){return gen3_forResult;}}');
  });
  
  it('for in', function() {
    var f = cg.forIn(
      cg.variable(['item']),
      cg.variable(['items']),
      cg.statements([cg.variable(['item'])])
    );
    
    generatesReturnExpression(f, 'for(var item in items){(function(item){item;}(item));}');
  });
  
  describe('for', function() {
    it('for', function() {
      var f = cg.forStatement(
        cg.definition(cg.variable(['i']), cg.integer(0)),
        cg.operator('<', [cg.variable(['i']), cg.integer(10)]),
        cg.definition(cg.variable(['i']), cg.operator('+', [cg.variable(['i']), cg.integer(1)])),
        cg.statements([cg.variable(['i'])])
      );
      
      generatesReturnExpression(f, 'for(i=0;(i<10);i=(i+1)){var gen1_forResult;gen1_forResult=void 0;if((function(i){i;}(i))){return gen1_forResult;}}');
    });

    it('rewrites return for returning from scope', function() {
      var f = cg.forStatement(
        cg.definition(cg.variable(['i']), cg.integer(0)),
        cg.operator('<', [cg.variable(['i']), cg.integer(10)]),
        cg.definition(cg.variable(['i']), cg.operator('+', [cg.variable(['i']), cg.integer(1)])),
        cg.statements([cg.returnStatement(cg.variable(['i']))])
      );
      
      generatesReturnExpression(f, 'for(i=0;(i<10);i=(i+1)){var gen1_forResult;gen1_forResult=void 0;if((function(i){gen1_forResult=i;return true;}(i))){return gen1_forResult;}}');
    });
  });
  
  it('while', function() {
    var w = cg.whileStatement(cg.variable(['c']), cg.statements([cg.variable(['s'])]));
    
    generatesStatement(w, 'while(c){s;}');
  });
  
  describe('method call', function () {
    it('method call', function () {
      var m = cg.methodCall(cg.variable(['console']), ['log'], [cg.variable(['stuff'])]);
      
      generatesExpression(m, 'console.log(stuff)');
    });

    it('methods allow reserved words as names', function () {
      var m = cg.methodCall(cg.variable(['console']), ['class'], [cg.variable(['stuff'])]);
      
      generatesExpression(m, 'console.class(stuff)');
    });

    it('method call with optional argument', function () {
      var m = cg.methodCall(cg.variable(['console']), ['log'], [cg.variable(['stuff'])], [cg.hashEntry(['port'], cg.integer(45))]);
      
      generatesExpression(m, 'console.log(stuff,{port:45})');
    });

    describe('splats', function () {
      it('just splat', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['b']), cg.splat()])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,b);');
      });
      
      it('splat call as expression', function () {
        var f = cg.statements([cg.functionCall(cg.variable(['f']), [cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['b']), cg.splat()])])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;f(gen1_o.m.apply(gen1_o,b));');
      });
      
      it('splat call as expression for return', function () {
        var f = cg.statements([cg.functionCall(cg.variable(['f']), [cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['b']), cg.splat()])])]);
      
        generatesStatementsReturn(f, 'var gen1_o;gen1_o=o;return f(gen1_o.m.apply(gen1_o,b));');
      });
      
      it('args before', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['a']), cg.variable(['b']), cg.splat()])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,[a].concat(b));');
      });
      
      it('args after', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['a']), cg.splat(), cg.variable(['b'])])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,a.concat([b]));');
      });
      
      it('two splats', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['a']), cg.variable(['b']), cg.splat(), cg.variable(['c']), cg.variable(['d']), cg.splat(), cg.variable(['e'])])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,[a].concat(b).concat([c]).concat(d).concat([e]));');
      });

      it('splat with optional args', function () {
        var f = cg.statements([cg.methodCall(cg.variable(['o']), ['m'], [cg.variable(['b']), cg.splat()], [cg.hashEntry(['port'], cg.variable(['p']))])]);
      
        generatesStatements(f, 'var gen1_o;gen1_o=o;gen1_o.m.apply(gen1_o,b.concat([{port:p}]));');
      });
    });
  });
  
  it('indexer', function () {
    var m = cg.indexer(cg.variable(['array']), cg.variable(['stuff']));
    
    generatesExpression(m, 'array[stuff]');
  });
  
  describe('field reference', function () {
    it('normal', function () {
      var m = cg.fieldReference(cg.variable(['obj']), ['field', 'name']);
    
      generatesExpression(m, 'obj.fieldName');
    });
    
    it('reserved words are allowed', function () {
      var m = cg.fieldReference(cg.variable(['obj']), ['class']);
    
      generatesExpression(m, 'obj.class');
    });
  });
  
  describe('return', function () {
    it('as statement', function () {
      var m = cg.returnStatement(cg.variable(['a']));
      generatesStatement(m, 'return a;');
    });
    
    it('as return', function () {
      var m = cg.returnStatement(cg.variable(['a']));
      generatesReturnExpression(m, 'return a;');
    });
    
    it('return void', function () {
      var m = cg.returnStatement();
      generatesReturnExpression(m, 'return;');
    });
  });
  
  describe('throw', function () {
    it('as statement', function () {
      var m = cg.throwStatement(cg.variable(['a']));
      generatesStatement(m, 'throw a;');
    });
    
    it('as return', function () {
      var m = cg.throwStatement(cg.variable(['a']));
      generatesReturnExpression(m, 'throw a;');
    });
  });

  describe('break', function () {
    it('as statement', function () {
      var m = cg.breakStatement(cg.variable(['a']));
      generatesStatement(m, 'break;');
    });
    
    it('as return', function () {
      var m = cg.breakStatement(cg.variable(['a']));
      generatesReturnExpression(m, 'break;');
    });
  });

  describe('continue', function () {
    it('as statement', function () {
      var m = cg.continueStatement(cg.variable(['a']));
      generatesStatement(m, 'continue;');
    });
    
    it('as return', function () {
      var m = cg.continueStatement(cg.variable(['a']));
      generatesReturnExpression(m, 'continue;');
    });
  });
  
  describe('if', function () {
    it('if statement', function () {
      var m = cg.statements([cg.ifExpression([[
        cg.variable(['obj']),
        cg.statements([cg.variable(['stuff'])])
      ]])]);
    
      generatesStatements(m, 'if(obj){stuff;}');
    });
  
    it('if else if else statement', function () {
      var m = cg.statements([cg.ifExpression([[
          cg.variable(['x', 'ok']),
          cg.statements([cg.variable(['x'])])
        ],
        [
          cg.variable(['y', 'ok']),
          cg.statements([cg.variable(['y'])])
        ]],
        cg.statements([cg.variable(['other', 'stuff'])])
      )]);
    
      generatesStatements(m, 'if(xOk){x;}else if(yOk){y;}else{otherStuff;}');
    });
  
    it('if expression', function () {
      var m = cg.ifExpression([[cg.variable(['obj']), cg.statements([cg.variable(['stuff'])])]]);
    
      generatesExpression(m, '(function(){if(obj){return stuff;}})()');
    });
  
    it('if else statement', function () {
      var m = cg.statements([cg.ifExpression([[
          cg.variable(['obj']),
          cg.statements([cg.variable(['stuff'])])
        ]],
        cg.statements([cg.variable(['other', 'stuff'])])
      )]);
    
      generatesStatements(m, 'if(obj){stuff;}else{otherStuff;}');
    });
  
    it('if else expression', function () {
      var m = cg.ifExpression([[cg.variable(['obj']), cg.statements([cg.variable(['stuff'])])]], cg.statements([cg.variable(['other', 'stuff'])]));
    
      generatesExpression(m, '(function(){if(obj){return stuff;}else{return otherStuff;}})()');
    });
  });

  describe('try', function () {
    it('try catch', function () {
      var t = cg.tryStatement(
        cg.statements([cg.variable(['a'])]),
        cg.block(
          [cg.variable(['ex'])],
          cg.statements([cg.variable(['b'])])
        )
      );

      generatesStatement(t, 'try{a;}catch(ex){b;}');
    });

    it("try catch is never returned", function () {
      var t = cg.tryStatement(
        cg.statements([cg.variable(['a'])]),
        cg.block(
          [cg.variable(['ex'])],
          cg.statements([cg.variable(['b'])])
        ),
        cg.statements([cg.variable(['c'])])
      );

      generatesReturnExpression(t, 'try{return a;}catch(ex){return b;}finally{return c;}');
    });

    it('try catch finally', function () {
      var t = cg.tryStatement(
        cg.statements([cg.variable(['a'])]),
        cg.block(
          [cg.variable(['ex'])],
          cg.statements([cg.variable(['b'])])
        ),
        cg.statements([cg.variable(['c'])])
      );

      generatesStatement(t, 'try{a;}catch(ex){b;}finally{c;}');
    });

    it('try finally', function () {
      var t = cg.tryStatement(
        cg.statements([cg.variable(['a'])]),
        undefined,
        cg.statements([cg.variable(['b'])])
      );

      generatesStatement(t, 'try{a;}finally{b;}');
    });

    it('try catch finally as an expression', function () {
      var t = cg.tryStatement(
        cg.statements([cg.variable(['a'])]),
        cg.block(
          [cg.variable(['ex'])],
          cg.statements([cg.variable(['b'])])
        ),
        cg.statements([cg.variable(['c'])])
      );

      generatesExpression(t, '(function(){try{return a;}catch(ex){return b;}finally{return c;}})()');
    });
  });
  
  describe('list', function() {
    it('with one element', function() {
      var l = cg.list([cg.variable(['stuff'])]);
      generatesExpression(l, '[stuff]');
    });
    
    it('with two elements', function() {
      var l = cg.list([cg.variable(['stuff']), cg.variable(['more', 'stuff'])]);
      generatesExpression(l, '[stuff,moreStuff]');
    });
    
    it('with no elements', function() {
      var l = cg.list([]);
      generatesExpression(l, '[]');
    });
  });
  
  describe('hash', function() {
    it('with one item', function() {
      var h = cg.hash([cg.hashEntry(['street', 'address'], cg.variable(['address']))]);
      generatesExpression(h, '{streetAddress:address}');
    });
    
    it('with two items, one with string field', function() {
      var h = cg.hash([
        cg.hashEntry(['street', 'address'], cg.variable(['address'])),
        cg.hashEntry(cg.string('Content-Type'), cg.string('text/plain'))
      ]);
      generatesExpression(h, "{streetAddress:address,'Content-Type':'text/plain'}");
    });
    
    it('with true item', function() {
      var h = cg.hash([
        cg.hashEntry(['street', 'address'], cg.boolean(true))
      ]);
      generatesExpression(h, "{streetAddress:true}");
    });
  });
  
  describe('symbol scope', function () {
    it('variable defined in outer scope, assigned to in inner scope', function () {
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
  
  describe('scope', function () {
    it('places scope contents inside a function which is called immediately', function () {
      var s = cg.scope([cg.definition(cg.variable(['a']), cg.integer(8)), cg.variable(['a'])]);
      
      generatesExpression(s, '(function(){var a;a=8;return a;})()');
    });

    it('if there is only one statement, it just generates that statement', function () {
      var s = cg.scope([cg.variable(['a'])]);
      
      generatesExpression(s, 'a');
    });
  });
  
  describe('module', function () {
    it('module should be wrapped in function', function () {
      var s = cg.module(cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.functionCall(cg.variable(['f']), [cg.block([], cg.statements([
          cg.definition(cg.variable(['x']), cg.integer(2)),
          cg.variable(['x'])
        ]))])
      ]));
      
      generatesExpression(s, '(function(){var self,x;self=this;x=1;f(function(){x=2;return x;});}).call(this);');
    });

    describe('when not in scope (inScope = false)', function () {
      it('module should not be wrapped in function', function () {
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

      it("when global, variables should not be declared with 'var'", function () {
        var s = cg.module(cg.statements([
          cg.definition(cg.variable(['x']), cg.integer(1)),
          cg.functionCall(cg.variable(['f']), [cg.block([], cg.statements([
            cg.definition(cg.variable(['x']), cg.integer(2)),
            cg.variable(['x'])
          ]))])
        ]));

        s.inScope = false;
        s.global = true;
        
        generatesExpression(s, 'x=1;f(function(){x=2;return x;});');
      });

      it("when global and return result, last statement should be returned", function () {
        var s = cg.module(cg.statements([
          cg.definition(cg.variable(['x']), cg.integer(1)),
          cg.functionCall(cg.variable(['f']), [cg.block([], cg.statements([
            cg.definition(cg.variable(['x']), cg.integer(2)),
            cg.variable(['x'])
          ]))])
        ]));

        s.inScope = false;
        s.global = true;
        s.returnResult = true;
        
        generatesExpression(s, 'x=1;return f(function(){x=2;return x;});');
      });
    });
  });
  
  describe('macro directory', function() {
    it('one macro', function() {
      var md = cg.createMacroDirectory();
      md.addMacro(['one'], 1);
      assert.equal(md.findMacro(['one']), 1);
    });
    
    it("longer name doesn't find macro with shorter name", function() {
      var md = cg.createMacroDirectory();
      md.addMacro(['one'], 1);
      assert.equal(md.findMacro(['one', 'two']), undefined);
    });
    
    it('finds correct macro among two', function() {
      var md = cg.createMacroDirectory();
      md.addMacro(['one'], 1);
      md.addMacro(['one', 'two'], 2);
      assert.equal(md.findMacro(['one', 'two']), 2);
    });
    
    it('adding same macro overwrites previous', function() {
      var md = cg.createMacroDirectory();
      md.addMacro(['one', 'two'], 2);
      md.addMacro(['one', 'two'], 3);
      assert.equal(md.findMacro(['one', 'two']), 3);
    });
    
    describe('wild card macros', function() {
      it('wild card macro with further name requirement', function () {
        var md = cg.createMacroDirectory();

        var macro = {};

        var wild = function (name) {
          if (name.length === 3 && name[2] === 'three') {
            return macro;
          }
        };

        md.addWildCardMacro(['one', 'two'], wild);

        assert.equal(md.findMacro(['one', 'two']), undefined);
        assert.equal(md.findMacro(['one', 'two', 'three']), macro);
        assert.equal(md.findMacro(['one', 'two', 'four']), undefined);
      });
      
      it('wild card macro with exact name', function () {
        var md = cg.createMacroDirectory();

        var macro = {};

        var wild = function (name) {
          return macro;
        };

        md.addWildCardMacro(['one', 'two'], wild);

        assert.equal(md.findMacro(['one', 'two']), macro);
      });
      
      it('normal macros have priority over wild card macros', function () {
        var md = cg.createMacroDirectory();

        var macro = {};

        var wild = function (name) {
          if (name.length === 3 && name[2] === 'three') {
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
    
    it('finds macro for invocation', function () {
       var macros = cg.createMacroDirectory();
       
       macros.addMacro(['one', 'two'], function (name, args, optionalArgs) {
          return {isOneTwo: true, arguments: args, optionalArgs: optionalArgs};
       });
       
       var inv = macros.invocation(['one', 'two'], ['args'], ['optionalArgs']);
       
       shouldContainFields(inv, {
         isOneTwo: true,
         arguments: ['args'],
         optionalArgs: ['optionalArgs']
       });
    });
    
    it('makes functionCall for invocation when no macro found', function () {
       var macros = cg.createMacroDirectory();
       
       var inv = macros.invocation(['one', 'two'], ['args'], ['optionalArgs']);
       
       shouldContainFields(inv, {
         isFunctionCall: true,
         function: {variable: ['one', 'two']},
         functionArguments: ['args'],
         optionalArguments: ['optionalArgs']
       });
    });
    
    it('makes variable for invocation when no macro found and no args given', function () {
       var macros = cg.createMacroDirectory();
       
       var inv = macros.invocation(['one', 'two']);
       
       shouldContainFields(inv, {
         isVariable: true,
         variable: ['one', 'two']
       });
    });
  });
  
  it('roll', function () {
    var list = [1, "a", "b", 3, "4", "5"];
    
    var collapsedList = cg.collapse(list, function (item) {
      if (typeof item === 'string')
        return item;
    }, function (group, item) {
      if (typeof item === 'string')
        return group + item;
    }, function (group) {
      return "~" + group;
    });
    
    shouldContainFields(collapsedList, [1, '~ab', 3, '~45']);
  });
  
  describe('parseSplatParameters', function () {
    it('no splat', function () {
      var splat = cg.parseSplatParameters(cg, [cg.variable(['a'])]);
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: undefined,
        lastParameters: []
      });
    });
    
    it('only splat', function () {
      var splat = cg.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.splat()
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [],
        splatParameter: {variable: ['a']},
        lastParameters: []
      });
    });
    
    it('splat start', function () {
      var splat = cg.parseSplatParameters(cg, [
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
    
    it('splat end', function () {
      var splat = cg.parseSplatParameters(cg, [
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
    
    it('splat middle', function () {
      var splat = cg.parseSplatParameters(cg, [
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
    
    it('two splats', function () {
      var secondSplat = cg.splat();
      secondSplat.secondSplat = true;
      
      var splat = cg.parseSplatParameters(cg, [
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
