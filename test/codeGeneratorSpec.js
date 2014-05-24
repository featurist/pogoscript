var cg = require('../lib/parser/codeGenerator').codeGenerator();
var MemoryStream = require('../lib/memorystream').MemoryStream;
var should = require('chai').should();
var _ = require('underscore');
var sm = require('source-map');

var shouldContainFields = require('./containsFields.js').containsFields;

describe('code generator', function () {
  function serialise(code) {
    return new sm.SourceNode (0, 0, 0, code).toString();
  }

  var generatesExpression = function (term, expectedGeneratedCode, print) {
    var code = serialise(term.generate(new cg.SymbolScope()));

    if (print) {
      console.log(code);
    }
    should.equal(code, expectedGeneratedCode);
  };
  
  var generatesStatement = function(term, expectedGeneratedCode) {
    var code = serialise(term.generateStatement(new cg.SymbolScope()));
    should.equal(code, expectedGeneratedCode);
  };
  
  var generatesStatements = function(term, expectedGeneratedCode, global, print) {
    var code = serialise(term.generateStatements(new cg.SymbolScope(), {inClosure: true, global: global}));
    if (print)
        console.log(stream.toString())
    should.equal(code, expectedGeneratedCode);
  };
  
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
    
    it("generates a semi-colon when as a statement", function () {
      generatesStatement(cg.variable(['asdf']), 'asdf;');
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
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['b']), cg.splat()], {optionalArguments: [cg.hashEntry(['port'], cg.variable(['p']))]});
      
        generatesExpression(f, 'f.apply(null,b.concat([{port:p}]))');
      });
    });

    describe('optional arguments', function () {
      it('with no arguments and an optional argument', function () {
        var f = cg.functionCall(cg.variable(['f']), [], {optionalArguments: [cg.hashEntry(['port'], cg.variable(['p']))]});

        generatesExpression(f, 'f({port:p})');
      });

      it('with an argument and two optional arguments', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a'])],
          {optionalArguments: [
            cg.hashEntry(['port'], cg.variable(['p'])),
            cg.hashEntry(['server'], cg.variable(['s'])),
            cg.hashEntry(['start'])
          ]});

        generatesExpression(f, 'f(a,{port:p,server:s,start:true})');
      });
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

    it('expression in string', function () {
      var s = cg.interpolatedString([cg.string("before "), cg.variable(['x']), cg.string(' after')]);

      generatesExpression(s, "('before '+x+' after')");
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
          isVariable: true,
          variable: ['a']
        });
      });
      
      it('with parameters', function () {
        var b = cg.block([cg.parameters([cg.variable(['a'])])], cg.statements([cg.variable(['a'])]));
        should.equal(b.scopify(), b);
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
    
    it('defines its parameters', function () {
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
      
      generatesExpression(b, 'function(x,y){var self=this;y(x);return x;}');
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
        cg.hashEntry(['start'], cg.boolean(true))
      ];
      
      generatesStatements(s, "var port;port=1;function(x,y,gen1_options){var port,start;port=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'port')&&gen1_options.port!==void 0?gen1_options.port:80;start=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'start')&&gen1_options.start!==void 0?gen1_options.start:true;y(x);return x;};");
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

      generatesStatements(s, "var y;y=1;function(x){var y=Array.prototype.slice.call(arguments,1,arguments.length-1);if(arguments.length>1){var z=arguments[arguments.length-1];}y(x);return z;};");
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
    
    it('chained definitions', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.definition(cg.variable(['two']), cg.integer(9)))]);
      
      generatesStatements(st, 'var two,one;one=two=9;');
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
    
    it('new variable becomes new function call', function() {
      var n = cg.newOperator(cg.variable(['Stack']));
    
      generatesExpression(n, 'new Stack()');
    });
  });
  
  it('for in', function() {
    var f = cg.statements([cg.forIn(
      cg.variable(['item']),
      cg.variable(['items']),
      cg.statements([cg.variable(['item'])])
    )]);
    
    generatesStatements(f, 'var item;for(item in items){((function(item){item;})(item));}');
  });
  
  describe('for', function() {
    it('for', function() {
      var f = cg.forStatement(
        cg.definition(cg.variable(['i']), cg.integer(0)),
        cg.operator('<', [cg.variable(['i']), cg.integer(10)]),
        cg.definition(cg.variable(['i']), cg.operator('+', [cg.variable(['i']), cg.integer(1)])),
        cg.statements([cg.variable(['i'])])
      );
      
      generatesExpression(f, 'for(i=0;(i<10);i=(i+1)){i;}');
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

    describe('optional arguments', function () {
      it('method call with optional argument', function () {
        var m = cg.methodCall(cg.variable(['console']), ['log'], [cg.variable(['stuff'])], {optionalArguments: [cg.hashEntry(['port'], cg.integer(45))]});

        generatesExpression(m, 'console.log(stuff,{port:45})');
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
  
  describe('if', function () {
    it('if statement', function () {
      var m = cg.statements([cg.ifExpression([{
        condition: cg.variable(['obj']),
        body: cg.statements([cg.variable(['stuff'])])
      }])]);
    
      generatesStatements(m, 'if(obj){stuff;}');
    });
  
    it('if else if else statement', function () {
      var m = cg.statements([cg.ifExpression([{
          condition: cg.variable(['x', 'ok']),
          body: cg.statements([cg.variable(['x'])])
        },
        {
          condition: cg.variable(['y', 'ok']),
          body: cg.statements([cg.variable(['y'])])
        }],
        cg.statements([cg.variable(['other', 'stuff'])])
      )]);
    
      generatesStatements(m, 'if(xOk){x;}else if(yOk){y;}else{otherStuff;}');
    });
  
    it('if else statement', function () {
      var m = cg.statements([cg.ifExpression([{
          condition: cg.variable(['obj']),
          body: cg.statements([cg.variable(['stuff'])])
        }],
        cg.statements([cg.variable(['other', 'stuff'])])
      )]);
    
      generatesStatements(m, 'if(obj){stuff;}else{otherStuff;}');
    });
  });

  describe('try', function () {
    it('try catch', function () {
      var t = cg.tryExpression(
        cg.statements([cg.variable(['a'])]),
        {
          catchBody: cg.statements([cg.variable(['b'])]),
          catchParameter: cg.variable(['ex'])
        }
      );

      generatesStatement(t, 'try{a;}catch(ex){b;}');
    });

    it('try catch finally', function () {
      var t = cg.tryExpression(
        cg.statements([cg.variable(['a'])]),
        {
          catchBody: cg.statements([cg.variable(['b'])]),
          catchParameter: cg.variable(['ex']),
          finallyBody: cg.statements([cg.variable(['c'])])
        }
      );

      generatesStatement(t, 'try{a;}catch(ex){b;}finally{c;}');
    });

    it('try finally', function () {
      var t = cg.tryExpression(
        cg.statements([cg.variable(['a'])]),
        {
          finallyBody: cg.statements([cg.variable(['b'])])
        }
      );

      generatesStatement(t, 'try{a;}finally{b;}');
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
    it('variable defined in outer scope, redefined in inner scope', function () {
      var s = cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.functionCall(cg.variable(['f']), [cg.block([], cg.statements([
          cg.definition(cg.variable(['x']), cg.integer(2)),
          cg.variable(['x'])
        ]))])
      ]);
      
      generatesStatements(s, 'var x;x=1;f(function(){var x;x=2;return x;});');
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
});
