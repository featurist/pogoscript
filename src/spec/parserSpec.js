require('cupoftea');
var assert = require('assert');
var _ = require('underscore');
var util = require('util');
var parser = require('../lib/parser');
var cg = require('../lib/codeGenerator');

spec('parser', function () {
  assert.containsFields = function (actual, expected, key, originalActual) {
    var inspectedOriginalActual = util.inspect(originalActual);
    
    if (typeof(expected) == 'object') {
      assert.ok(typeof(actual) == 'object', 'in ' + inspectedOriginalActual + ', expected ' + key + ' ' + util.inspect(actual) + ' to be an object');
      
      var parentKey;
      if (key) {
        parentKey = key + '.';
      } else {
        parentKey = '';
      }
      
      var originalActual = (originalActual || actual);
      for (var key in expected) {
        assert.containsFields(actual[key], expected[key], parentKey + key, originalActual);
      }
    } else {
      var inspectedActual = util.inspect(actual);
      var inspectedExpected = util.inspect(expected);
      var msg = 'in ' + inspectedOriginalActual + ', ' + key + ' ' + inspectedActual + ' should be equal to ' + inspectedExpected;
      assert.deepEqual(expected, actual, msg);
    }
  };
  
  assert.doesntParse = function (obj) {
    assert.ok(obj.isError);
  };
  
  spec('integer', function () {
    spec('parses integer', function () {
      assert.containsFields(parser.parse(parser.integer, '8'), {integer: 8, index: 1});
    });

    spec('parses big integer', function () {
      assert.containsFields(parser.parse(parser.integer, '888'), {integer: 888, index: 3});
    });

    spec("doesn't parse identifier", function () {
      assert.doesntParse(parser.parse(parser.integer, 'id'));
    });

    spec("parses integer followed by id", function () {
      assert.containsFields(parser.parsePartial(parser.integer, '8 id'), {integer: 8, index: 1});
    });

    spec("parses integer within source", function () {
      assert.containsFields(parser.parsePartial(parser.integer, 'id 8', 3), {integer: 8, index: 4});
    });

    spec("doesn't parse integer within source", function () {
      assert.doesntParse(parser.parsePartial(parser.integer, 'id id 8', 3));
    });

    spec("parses one integer from many in source", function () {
      assert.containsFields(parser.parsePartial(parser.integer, 'id 1 2 3 4 5 6 7 8', 9), {integer: 4, index: 10});
    });
  });
  
  spec('identifier parses identifier', function () {
    spec('parses identifier', function () {
      assert.containsFields(parser.parsePartial(parser.identifier, 'one two tHrEe four five', 8), {identifier: 'tHrEe', index: 13});
    });
    
    spec('parses identifier containing digits', function () {
      assert.containsFields(parser.parse(parser.identifier, 'three3four4'), {identifier: 'three3four4', index: 11});
    });
    
    spec('parses identifier with leading spaces', function () {
      assert.containsFields(parser.parse(parser.identifier, ' one'), {identifier: 'one', index: 4});
    });
    
    spec('parses identifier with symbol', function () {
      assert.containsFields(parser.parse(parser.operator, ' ++-/*<>='), {identifier: '++-/*<>=', index: 9});
    });
  });
  
  spec('non interpolated string', function() {
    spec('with no single quotes', function() {
      assert.containsFields(parser.parsePartial(parser.string, " 'this is a string'"), {index: 19, string: 'this is a string'});
    });
    
    spec('empty string', function() {
      assert.containsFields(parser.parsePartial(parser.string, " ''"), {index: 3, string: ''});
    });
    
    spec('stirng with quoted single quote', function() {
      assert.containsFields(parser.parsePartial(parser.string, " 'Kate''s place'"), {index: 16, string: "Kate's place"});
    });
  });
  
  spec('whitespace', function () {
    spec('parses some whitespace', function () {
      assert.containsFields(parser.parsePartial(parser.whitespace, '   one'), {index: 3});
    });
    
    spec('even parses no whitespace', function () {
      assert.containsFields(parser.parsePartial(parser.whitespace, 'one'), {index: 0});
    });
  });
  
  spec('float', function () {
    spec('parses floats', function () {
      assert.containsFields(parser.parse(parser.float, '5.6'), {float: 5.6, index: 3});
    });

    spec("doesn't parse floats", function () {
      spec("that terminate immediately after the point", function() {
        assert.doesntParse(parser.parsePartial(parser.float, '5.'));
      });

      spec("that don't have digits after the point", function() {
        assert.doesntParse(parser.parsePartial(parser.float, '5.d'));
      });

      spec("that are just integers", function() {
        assert.doesntParse(parser.parsePartial(parser.float, '5'));
      });
    });
  });
  
  spec('keyword', function () {
    spec('parses keywords', function () {
      assert.containsFields(parser.parse(parser.keyword('object'), 'object'), {keyword: 'object', index: 6});
    });
    
    spec('parses keywords that are also regular expression characters', function () {
      assert.containsFields(parser.parse(parser.keyword(')'), ')'), {keyword: ')', index: 1});
    });
  });
  
  spec('sequence', function () {
    var seq = parser.sequence(
        ['name', parser.identifier],
        parser.keyword('to'),
        ['id', parser.integer]);

    spec('parses correct sequences', function () {
      assert.containsFields(parser.parse(seq, 'tank to 8'), {index: 9, name: {identifier: 'tank', index: 4}, id: {integer: 8, index: 9}});
    });

    spec('should not parse sequence', function () {
      assert.doesntParse(parser.parse(seq, '9 to tank'));
    });
    
    spec('with ending keyword should parse', function () {
      seq = parser.sequence(
        parser.keyword('('),
        ['expression', parser.identifier],
        parser.keyword(')'));
        
      assert.containsFields(parser.parse(seq, '(one)'), {expression: {identifier: 'one'}, index: 5});
    });
  });
  
  spec('choice (float or identifier)', function () {
    var floatOrIdentifier = parser.choice(parser.float, parser.identifier);
    
    spec('parses float', function () {
      assert.containsFields(parser.parse(floatOrIdentifier, '78.4'), {index: 4, float: 78.4});
    });
    
    spec('parses identifier', function () {
      assert.containsFields(parser.parse(floatOrIdentifier, 'xxy'), {index: 3, identifier: 'xxy'});
    });
    
    spec("doesn't parse integer", function () {
      assert.doesntParse(parser.parse(floatOrIdentifier, '45'));
    });
  });
  
  var assertParser = function (p) {
    return function (src, expectedTerm) {
      var term = parser.parse(p, src);
      
      assert.ok(term);
      assert.containsFields(term, expectedTerm);
    };
  };
  
  spec('multiple', function () {
    spec('parses multiple identifiers', function () {
      assert.containsFields(parser.parse(parser.multiple(parser.identifier), 'one two three'), [{identifier: 'one'}, {identifier: 'two'}, {identifier: 'three'}]);
    });
    
    spec('parses at least one item', function () {
      assert.doesntParse(parser.parse(parser.multiple(parser.identifier), ''));
    });
    
    spec('parses only 2 identifiers out 3', function () {
      assert.containsFields(parser.parsePartial(parser.multiple(parser.identifier, undefined, 2), 'one two three'), [{identifier: 'one'}, {identifier: 'two'}]);
    });
    
    spec("doesn't parse unless there are at least two identifiers", function () {
      assert.doesntParse(parser.parse(parser.multiple(parser.identifier, 2), 'one'));
    });
    
    spec("parses zero terms", function () {
      assert.containsFields(parser.parse(parser.multiple(parser.identifier, 0), ''), []);
    });
  });
  
  spec('delimited', function () {
    spec('parses one item with no delimiters', function () {
      assert.containsFields(parser.parse(parser.delimited(parser.identifier, parser.keyword(',')), 'one'), [{identifier: 'one'}]);
    });
    
    spec('parses two items with delimiter', function () {
      assert.containsFields(parser.parse(parser.delimited(parser.identifier, parser.keyword(',')), 'one, two'), [{identifier: 'one'}, {identifier: 'two'}]);
    });
  });
  
  spec('optional', function () {
    spec('parses zero items', function () {
      assert.containsFields(parser.parse(parser.optional(parser.identifier), ''), []);
    });
    
    spec('parses one item', function () {
      assert.containsFields(parser.parse(parser.optional(parser.identifier), 'one'), [{identifier: 'one'}]);
    });
  });
  
  spec('transform', function () {
    var fakeParser = function (source, index, context) {
      return {
        dontMemoise: true,
        index: source.length,
        context: 'context'
      };
    };
    
    spec('uses index context and dontMemoise from original term', function () {
      assert.containsFields(parser.parse(parser.transform(fakeParser, function (term) {
        return {
          thisIsTransformed: true
        };
      }), 'one'), {dontMemoise: true, index: 3, context: 'context', thisIsTransformed: true});
    });
    
    spec("doesn't transform if not parsed", function () {
      assert.doesntParse(parser.parse(parser.transform(parser.identifier, function (term) {
        return {
          index: 2,
          thisIsTransformed: true
        };
      }), '1'));
    });
  });
  
  spec('terminal', function () {
    var assertTerminal = assertParser(parser.terminal);
    var notTerminal = function (src) {
      assert.doesntParse(parser.parse(parser.terminal, src));
    };
    
    spec('argument', function () {
      assertTerminal('@arg1', {variable: ['arg1']});
    });
    
    spec("doesn't parse argument with space between at symbol and identifier", function () {
      notTerminal('@ arg1');
    });
    
    spec('parses bracketed expression', function () {
      assertTerminal('(var name)', {variable: ['var', 'name'], index: 10});
    });

    spec('blocks', function() {
      spec('parses block', function () {
        assertTerminal('{var name}', {body: {statements: [{variable: ['var', 'name']}]}, index: 10});
      });

      spec('parses block on multiple lines', function () {
        assertTerminal('{\n  var name\n}', {body: {statements: [{variable: ['var', 'name']}]}, index: 14});
      });

      spec('parses block with two statements on multiple lines', function () {
        assertTerminal('{\n  one\n  two\n}', {body: {statements: [{variable: ['one']}, {variable: ['two']}]}, index: 15});
      });

      spec('parses empty block', function () {
        assertTerminal('{}', {body: {statements: []}, index: 2});
      });
    });
  });
  
  spec('expression', function () {
    var assertExpression = assertParser(parser.expression);
    var assertNotExpression = function (src, expectedError) {
      var error = parser.parse(parser.expression, src);
      assert.ok(error.isError);
      if (expectedError) {
        assert.containsFields(error, expectedError);
      }
    };
    
    spec('with just one terminal resolves to that terminal', function () {
      assertExpression('9', {integer: 9});
    });
    
    spec('function call', function () {
      spec('parses function call with two arguments', function () {
        assertExpression('move @src to @dest',
          {
            index: 18,
            function: {variable: ['move', 'to']},
            arguments: [{variable: ['src']}, {variable: ['dest']}]
          });
      });
      
      spec('parses function call with bracketed argument', function () {
        assertExpression('fun (one argument) @two',
          {
            index: 23,
            function: {variable: ['fun']},
            arguments: [{variable: ['one', 'argument']}, {variable: ['two']}]
          });
      });
      
      spec('parses function call with no arguments', function () {
        assertExpression('save all files to disk!',
          {
            index: 23,
            function: {variable: ['save', 'all', 'files', 'to', 'disk']},
            arguments: []
          });
      });
      
      spec('parses function call with function as expression', function () {
        assertExpression('(f!) 5',
          {
            index: 6,
            function: {function: {variable: ['f']}},
            arguments: [{integer: 5}]
          });
      });
      
      spec('parses block alone', function () {
        assertExpression('?i {j}',
          {
            index: 6,
            body: {statements: [{variable: ['j']}]},
            parameters: [{parameter: ['i']}]
          });
      });
      
      spec('lists', function() {
        spec('parses empty list', function () {
          assertExpression('[]',
            {
              index: 2,
              list: []
            });
        });

        spec('parses list with two integers', function () {
          assertExpression('[1, 2]',
            {
              index: 6,
              list: [{integer: 1}, {integer: 2}]
            });
        });

        spec('parses list with items on lines', function () {
          assertExpression('[\n  1\n  2]',
            {
              index: 10,
              list: [{integer: 1}, {integer: 2}]
            });
        });

        spec('parses list with integer and block', function () {
          assertExpression('[1, ?a {}]',
            {
              index: 10,
              list: [{integer: 1}, {parameters: [{parameter: ['a']}], body: {statements: []}}]
            });
        });
      });
      
      spec('hashes', function() {
        spec('empty hash', function() {
          assertExpression('#{}', {
            index: 3,
            isHash: true,
            entries: []
          });
        });
        
        spec('hash with two entries', function() {
          assertExpression('#{port @p, domain @d}', {
            index: 21,
            isHash: true,
            entries: [
              {field: ['port'], value: {variable: ['p']}},
              {field: ['domain'], value: {variable: ['d']}}
            ]
          });
        });
        
        spec('hash with true entry', function() {
          assertExpression('#{readonly}', {
            index: 11,
            isHash: true,
            entries: [
              {field: ['readonly'], value: {boolean: true}}
            ]
          });
        });
        
        spec('hash with string field', function() {
          assertExpression("#{'Content-Type' @content}", {
            index: 26,
            isHash: true,
            entries: [
              {field: ['Content-Type'], value: {variable: ['content']}}
            ]
          });
        });
      });
      
      spec('if', function() {
        spec('if', function () {
          assertExpression('if @condition\n  stuff\n',
            {
              index: 22,
              isIfExpression: true,
              condition: {variable: ['condition']},
              then: {statements: [{variable: ['stuff']}]}
            });
        });

        spec('if else', function () {
          assertExpression('if @condition\n  stuff\nelse\n  other stuff\n',
            {
              index: 41,
              isIfExpression: true,
              condition: {variable: ['condition']},
              then: {statements: [{variable: ['stuff']}]},
              _else: {statements: [{variable: ['other', 'stuff']}]}
            });
        });
      });
      
      spec('for each', function() {
        assertExpression('for each ?item in @items do\n  item',
        {
          index: 34,
          statements: [{isDefinition: true}, {isFor: true}]
        });
      });
      
      spec('for', function() {
        assertExpression('for {n = 0} {@n <= 10} {n = @n + 1}\n  n',
        {
          isFor: true,
          initialization: {target: {variable: ['n']}, source: {integer: 0}},
          test: {operator: '<=', arguments: [{variable: ['n']}, {integer: 10}]},
          increment: {target: {variable: ['n']}, source: {operator: '+', arguments: [{variable: ['n']}, {integer: 1}]}}
        });
      });
      
      spec('while', function() {
        assertExpression('while {a} {b}', {
          isWhile: true,
          test: {variable: ['a']},
          statements: {statements: [{variable: ['b']}]}
        });
      });
      
      spec('operators', function() {
        spec('plus', function() {
          assertExpression('@a + @b', {
            operator: '+',
            arguments: [{variable: ['a']}, {variable: ['b']}]
          });
        });
        
        spec('multiply', function() {
          assertExpression('@a * @b', {
            operator: '*',
            arguments: [{variable: ['a']}, {variable: ['b']}]
          });
        });
        
        spec('minus', function() {
          assertExpression('@a - @b', {
            operator: '-',
            arguments: [{variable: ['a']}, {variable: ['b']}]
          });
        });
        
        spec('divide', function() {
          assertExpression('@a / @b', {
            operator: '/',
            arguments: [{variable: ['a']}, {variable: ['b']}]
          });
        });
        
        spec('and', function() {
          assertExpression('@a and @b', {
            operator: '&&',
            arguments: [{variable: ['a']}, {variable: ['b']}]
          });
        });
        
        spec('or', function() {
          assertExpression('@a or @b', {
            operator: '||',
            arguments: [{variable: ['a']}, {variable: ['b']}]
          });
        });
        
        spec('not', function() {
          assertExpression('not @a', {
            operator: '!',
            arguments: [{variable: ['a']}]
          });
        });
        
        spec('negative', function() {
          assertExpression('- @a', {
            operator: '-',
            arguments: [{variable: ['a']}]
          });
        });
      });
      
      spec("doesn't parse function call with no arg suffix and arguments", function () {
        assertExpression('save @files to disk!', {
          isSemanticFailure: true
        });
      });
  
      spec('definition', function () {
        spec('of variable', function () {
          assertExpression('my var = 9', {
            index: 10,
            target: {variable: ['my', 'var']},
            source: {integer: 9}
          });
        });
        
        spec('of block', function () {
          assertExpression('function that returns number =\n  9\n', {
            index: 35,
            target: {variable: ['function', 'that', 'returns', 'number']},
            source: {body: {statements: [{integer: 9}]}}
          });
        });
        
        spec('of block with parameters', function () {
          assertExpression('identity ?a = {a}', {
            index: 17,
            target: {variable: ['identity']},
            source: {parameters: [{parameter: ['a']}], body: {statements: [{variable: ['a']}]}}
          });
        });
        
        spec('of expression with parameters', function () {
          assertExpression('identity ?a = a', {
            index: 15,
            target: {variable: ['identity']},
            source: {parameters: [{parameter: ['a']}], body: {variable: ['a']}}
          });
        });
        
        spec('of object field', function () {
          assertExpression('object: field = a', {
            index: 17,
            target: {
              object: {variable: ['object']},
              name: ['field']
            },
            source: {variable: ['a']}
          });
        });
        
        spec('of object method', function () {
          assertExpression('object: method ?p = p', {
            index: 21,
            target: {
              object: {variable: ['object']},
              name: ['method']
            },
            source: {parameters: [{parameter: ['p']}], body: {variable: ['p']}}
          });
        });
        
        spec('of array index', function () {
          assertExpression('array: 8 = a', {
            index: 12,
            target: {
              object: {variable: ['array']},
              indexer: {integer: 8}
            },
            source: {variable: ['a']}
          });
        });
      });
      
      spec('defines parameters for block', function () {
        assertExpression('map each ?item into {change @item}',
          {
            function: {variable: ['map', 'each', 'into']},
            arguments: [{parameters: [{parameter: ['item']}], body: {statements: [{function: {variable: ['change']}, arguments: [{variable: ['item']}]}]}}]
          });
      });
      
      spec('return', function() {
        assertExpression('return 5', {
          index: 8,
          isReturn: true,
          expression: {integer: 5}
        });
      });
    });
    
    spec('variable', function () {
      assertExpression('this is a variable',
        {
          index: 18,
          variable: ['this', 'is', 'a', 'variable']
        }
      );
    });
    
    spec('new', function() {
      spec('with no args', function() {
        assertExpression('new (stack!)',
        {
          index: 12,
          isNewOperator: true,
          functionCall: {
            function: {variable: ['stack']},
            arguments: []
          }
        });
      });
      
      spec('with arguments', function() {
        assertExpression('new (stack 5)',
        {
          index: 13,
          isNewOperator: true,
          functionCall: {
            function: {variable: ['stack']},
            arguments: [{integer: 5}]
          }
        });
      });
    });
    
    spec('object', function () {
      spec('method call', function () {
        assertExpression('console: log @stuff', {
          index: 19,
          object: {variable: ['console']},
          name: ['log'],
          arguments: [{variable: ['stuff']}]
        });
      });
      
      spec('nested method call', function () {
        assertExpression('obj: describe @stuff: fix @it', {
          index: 29,
          object: {
            index: 20,
            object: {variable: ['obj']},
            name: ['describe'],
            arguments: [{variable: ['stuff']}]
          },
          name: ['fix'],
          arguments: [{variable: ['it']}]
        });
      });
      
      spec('with index', function () {
        spec('as integer', function () {
          assertExpression('array: 9', {
            index: 8,
            object: {
              index: 5,
              variable: ['array']
            },
            indexer: {integer: 9}
          });
        });
        
        spec('as variable', function () {
          assertExpression('array: @a', {
            index: 9,
            object: {
              index: 5,
              variable: ['array']
            },
            indexer: {variable: ['a']}
          });
        });
      });
      
      spec('with field reference', function () {
        assertExpression('person: phone number', {
          index: 20,
          isFieldReference: true,
          object: {
            index: 6,
            variable: ['person']
          },
          name: ['phone', 'number']
        });
      });
    });
  });
  
  spec('statements', function () {
    var assertStatements = assertParser(parser.statements);
    
    spec('two statements', function () {
      var statements = {
        statements: [
          {function: {variable: ['one']}},
          {function: {variable: ['two']}}
        ]
      };
    
      spec('on two lines', function () {
        assertStatements('one!\ntwo!', statements);
      });
    
      spec('separated by dots', function () {
        assertStatements('one! .two!', statements);
      });
    
      spec('on two lines with one line empty', function () {
        assertStatements('one!\n\ntwo!', statements);
      });
    });
    
    spec('in indented block', function () {
      assertStatements('do {\n\tstuff\n}', {
        statements: [{
          function: {variable: ['do']},
          arguments: [{body: {statements: [{variable: ['stuff']}]}}]
        }]
      });
    });
    
    spec('statements after indented block', function () {
      assertStatements('do\n  stuff!\n\nsomething else!', {
        statements: [
          {
            function: {variable: ['do']},
            arguments: [{body: {statements: [{function: {variable: ['stuff']}}]}}]
          },
          {function: {variable: ['something', 'else']}}
        ]
      });
    });
    
    spec('unwinds from one indents', function() {
      assertStatements('block\n  x\n\nout', {
        statements: [
          {
            function: {variable: ['block']},
            arguments: [{
              body: {
                statements: [{variable: ['x']}]
              }
            }]
          },
          {variable: ['out']}
        ]
      });
    });
    
    spec('unwinds from two indents', function() {
      assertStatements('block\n  block\n    x\n\nout', {
        statements: [
          {
            function: {variable: ['block']},
            arguments: [{
              body: {
                statements: [
                  {
                    function: {variable: ['block']},
                    arguments: [{
                      body: {
                        statements: [{variable: ['x']}]
                      }
                    }]
                  }
                ]
              }
            }]
          },
          {variable: ['out']}
        ]
      });
    });
  });
  
  spec('indentation', function() {
    spec('indent', function() {
      spec('parses', function() {
        assert.containsFields(parser.parsePartial(parser.indent, '\n  s', 0, new parser.Context().withIndentation('')), {context: {indentation: '  '}});
        assert.containsFields(parser.parsePartial(parser.indent, '\n \n  s', 0, new parser.Context().withIndentation(' ')), {context: {indentation: '  '}});
      });

      spec("doesn't parse", function() {
        assert.doesntParse(parser.parsePartial(parser.indent, '\n  s', 0, new parser.Context().withIndentation('  ')));
        assert.doesntParse(parser.parsePartial(parser.indent, '\n \n  s', 0, new parser.Context().withIndentation('  ')));
        assert.doesntParse(parser.parsePartial(parser.indent, '  s', 0, new parser.Context().withIndentation('')));
      });
    });

    spec('unindent', function() {
      spec('parses', function() {
        assert.containsFields(parser.parsePartial(parser.unindent, '\n  s', 0, new parser.Context().withIndentation('  ').withIndentation('    ')), {context: {indentation: '  '}, index: 3});
        assert.containsFields(parser.parsePartial(parser.unindent, '\n  \ns', 0, new parser.Context().withIndentation('  ')), {context: {indentation: ''}, index: 3});
        assert.containsFields(parser.parsePartial(parser.unindent, '\n\n s', 0, new parser.Context().withIndentation(' ').withIndentation('   ')), {context: {indentation: ' '}, index: 1});
      });

      spec('parses two unindents', function() {
        assert.containsFields(parser.parsePartial(parser.multiple(parser.unindent, 2, 2), '\n\ns', 0, new parser.Context().withIndentation('  ').withIndentation('    ')), [{context: {indentation: '  '}}, {context: {indentation: ''}}]);
      });

      spec('parses end of source', function() {
        assert.containsFields(parser.parsePartial(parser.multiple(parser.unindent, 2, 2), '  ', 2, new parser.Context().withIndentation('  ').withIndentation('    ')), [{context: {indentation: '  '}}, {context: {indentation: ''}}]);
      });

      spec("doesn't parse", function() {
        assert.doesntParse(parser.parsePartial(parser.unindent, '\n  s', 0, new parser.Context()));
        assert.doesntParse(parser.parsePartial(parser.unindent, '\n  s', 0, new parser.Context().withIndentation('  ')));
        assert.doesntParse(parser.parsePartial(parser.unindent, '  s', 0, new parser.Context()));
      });
    });
    
    spec('no indent', function() {
      spec('parses', function() {
        assert.containsFields(parser.parsePartial(parser.noindent, '\n  s', 0, new parser.Context().withIndentation('  ')), {context: {indentation: '  '}});
        assert.containsFields(parser.parsePartial(parser.noindent, '\n  \ns', 0, new parser.Context()), {context: {indentation: ''}});
        assert.containsFields(parser.parsePartial(parser.noindent, '\n\n s', 0, new parser.Context().withIndentation(' ')), {context: {indentation: ' '}});
      });

      spec("doesn't parse", function() {
        assert.doesntParse(parser.parsePartial(parser.noindent, '\n  s', 0, new parser.Context().withIndentation('')));
        assert.doesntParse(parser.parsePartial(parser.noindent, '\n  s', 0, new parser.Context().withIndentation('    ')));
        assert.doesntParse(parser.parsePartial(parser.noindent, '  s', 0, new parser.Context()));
      });
    });
    
    spec('reset indent', function() {
      spec('parses start', function() {
        assert.containsFields(parser.parsePartial(parser.startResetIndent, '\n  s', 0, new parser.Context().withIndentation('    ')), {context: {indentation: '  '}});
      });
      spec('parses start without newline', function() {
        assert.containsFields(parser.parsePartial(parser.startResetIndent, '  s', 0, new parser.Context().withIndentation('    ')), {context: {indentation: '    '}});
      });
      spec('parses end', function() {
        assert.containsFields(parser.parsePartial(parser.endResetIndent, '\n  }', 0, new parser.Context().withIndentation('    ')), {context: {indentation: ''}});
      });
      spec('parses end without newline', function() {
        assert.containsFields(parser.parsePartial(parser.endResetIndent, '}', 0, new parser.Context().withIndentation('    ')), {context: {indentation: ''}});
      });
    });
  });
  
  spec('indentation syntax', function () {
    var i = parser.sequence(['function', parser.multiple(parser.identifier)], parser.indent, ['block', parser.delimited(parser.identifier, parser.noindent)], parser.unindent);
    var shouldParse = function(src, expectedTerm) {
      assert.containsFields(parser.parsePartial(i, src), expectedTerm);
    };
    
    spec('normal', function() {
      shouldParse('func\n  block1\n  block2\nout', {function: [{identifier: 'func'}], block: [{identifier: 'block1'}, {identifier: 'block2'}]});
    });
    
    spec('starting with empty line', function() {
      shouldParse('func\n\n  block1\n  block2\nout', {function: [{identifier: 'func'}], block: [{identifier: 'block1'}, {identifier: 'block2'}]});
    });
    
    spec('containing empty line', function() {
      shouldParse('func\n  block1\n\n  block2\nout', {function: [{identifier: 'func'}], block: [{identifier: 'block1'}, {identifier: 'block2'}]});
    });
  });
  
  spec('module', function() {
    assert.containsFields(parser.parse(parser.module, 'one!\ntwo!\n'), {statements: {statements: [{function: {variable: ['one']}}, {function: {variable: ['two']}}]}});
  });
  
  spec('context', function () {
    spec("creating new context does't change previousIndentations", function() {
      var c1 = new parser.Context();
      c1.indentation = 4;
      var c2 = c1.withIndentation(6);
      assert.equal(c2.indentation, 6);
      var c3 = c2.withIndentation(7);
      assert.equal(c3.indentation, 7);
      var c4 = c3.oldIndentation();
      assert.equal(c4.indentation, 6);
      var c5 = c4.oldIndentation();
      assert.equal(c5.indentation, 4);
    });
  });
  
  spec('memotable', function() {
    var memotable = new parser.MemoTable();
    var changingResult = 1;
    var notToMemoise = memotable.memoise(function(source, index, context) {
      return {dontMemoise: true, changingResult: changingResult++};
    });
    var toMemoise = memotable.memoise(function(source, index, context) {
      return {changingResult: changingResult++};
    });
    
    spec("memoises if context and index are the same", function() {
      var context = {};
      assert.containsFields(toMemoise('', 0, context), {
        changingResult: 1
      });
      assert.containsFields(toMemoise('', 0, context), {
        changingResult: 1
      });
    });
    
    spec("doesn't memoise if term returns dont memoise", function() {
      var context = {};
      assert.containsFields(notToMemoise('', 0, context), {
        dontMemoise: true,
        changingResult: 1
      });
      assert.containsFields(notToMemoise('', 0, context), {
        dontMemoise: true,
        changingResult: 2
      });
    });
    
    spec("reparses if context is different on second parse", function() {
      var context = {};
      assert.containsFields(toMemoise('', 0, context), {
        changingResult: 1
      });
      assert.containsFields(toMemoise('', 0, {}), {
        changingResult: 2
      });
    });
  });
});
