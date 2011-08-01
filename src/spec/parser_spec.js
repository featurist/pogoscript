require('cupoftea');
var assert = require('assert');
var _ = require('underscore');
var util = require('util');

spec('parser', function () {
  var MemoTable = function () {
    var memos = [];
    var addMemo = function(memo) {
      memos.push(memo);
    };

    this.clear = function () {
      for (var i in memos) {
        var memo = memos[i];
        memo.table = {};
      }
    };

    this.memoise = function (parser) {
      var memo = {table: {}};
      addMemo(memo);
      return function (source, index, context, continuation) {
        var parseResult = memo.table[index];
        if (parseResult) {
          success(parseResult, continuation);
        } else {
          parser(source, index, context, function (parseResult) {
            memo.table[index] = parseResult;
            success(parseResult, continuation);
          });
        }
      };
    };
  };
	
	var memotable = new MemoTable();
	
	var ignoreLeadingWhitespace = function (parser) {
    return function (source, index, context, continuation) {
      whitespace(source, index, context, function (parsedWhitespace) {
        parser(source, parsedWhitespace.index, parsedWhitespace.context, continuation);
      });
    };
  };
	
	var success = function (term, continuation) {
	  continuation(term);
	};
	
	var failure = function (continuation) {
	  continuation(null);
	};
	
	var createParser = function (name, originalRe, createTerm, dontIgnoreWhitespace) {
		var ignoreCaseFlag = originalRe.ignoreCase? 'i': '';
		
		var re = new RegExp(originalRe.source, 'g' + ignoreCaseFlag);
		var parser = memotable.memoise(function (source, index, context, continuation) {
			re.lastIndex = index;
			var match = re.exec(source);
			if (match && match.index == index) {
				var term = createTerm(match[0]);
				term.index = re.lastIndex;
				term.context = context;
				success(term, continuation);
			} else {
			  failure(continuation);
			}
		});
		
		var nameParser = function (parser) {
		  parser.parserName = name;
		  return parser;
		};
		
		if (dontIgnoreWhitespace) {
  		return nameParser(parser);
		} else {
		  return nameParser(ignoreLeadingWhitespace(parser));
  	}
	};
	
  var sequence = (function () {
    var NamedSubTerm = function (name, parser) {
      this.name = name;
      this.parser = parser;
      this.addToTerm = function (term, result) {
        term[this.name] = result;
      };
    };
    
    var UnnamedSubTerm = function (parser) {
      this.parser = parser;
      this.addToTerm = function (term) {
        // unnamed sub terms are not added to the term
      };
    };
    
    var readSubTerm = function (subterm) {
      if (_.isArray(subterm)) {
        return new NamedSubTerm(subterm[0], subterm[1]);
      } else {
        return new UnnamedSubTerm(subterm);
      }
    };
    
    return function () {
      var termName = arguments[0];
      
      var subterms = _.map(_.rest(arguments), function (subtermArgument) {
        return readSubTerm(subtermArgument);
      });
      
      return function (source, startIndex, context, continuation) {
        var term = {termName: termName, index: startIndex};
        
        var parseSubTerm = function (subtermIndex, index, context) {
          var subterm = subterms[subtermIndex];
          if (subterm) {
            subterm.parser(source, index, context, nextSubTermParser(subterm, subtermIndex + 1));
          } else {
            term.index = index;
            term.context = context;
            success(term, continuation);
          }
        };
        
        var nextSubTermParser = function (previousSubterm, subtermIndex) {
          return function (result) {
            if (result) {
              previousSubterm.addToTerm(term, result);
              parseSubTerm(subtermIndex, result.index, result.context);
            } else {
              failure(continuation);
            }
          };
        };
        
        parseSubTerm(0, startIndex);
      };
    };
  }());
	
	var integer = createParser(
	  'integer',
		/\d+/,
		function (match) {
			return {integer: parseInt(match)};
		}
	);
	
	var float = createParser(
	  'float',
		/\d+\.\d+/,
		function (match) {
			return {float: parseFloat(match)};
		}
	);
	
	var whitespace = createParser(
	  'whitespace',
	  /[ \t]*/,
	  function (match) {
	    return {};
	  },
  	true
	);
	
	var identifier = createParser(
	  'identifier',
		/[a-z]+/i,
		function (match) {
			return {identifier: match};
		}
	);
	
	var keyword = function (kw) {
	  return createParser(
	    'keyword "' + kw + '"',
  	  new RegExp(kw),
  	  function (match) {
  	    return {keyword: match};
      }
    );
	};
	
	var choice = function () {
	  var choiceParsers = arguments;
	  
	  return function (source, index, context, continuation) {
	    var parseChoice = function (choiceIndex) {
  	    var choiceParser = choiceParsers[choiceIndex];

        if (choiceParser) {
    	    choiceParser(source, index, context, parseNextChoice(choiceIndex + 1));
  	    } else {
  	      failure(continuation);
  	    }
	    };
	    
  	  var parseNextChoice = function (choiceIndex) {
  	    return function (result) {
	        if (result) {
	          success(result, continuation);
          } else {
            parseChoice(choiceIndex);
          } 
  	    }
  	  };
  	  
  	  parseChoice(0);
    };
	};
	
	assert.containsFields = function (actual, expected, key, originalActual) {
	  if (typeof(expected) == 'object') {
	    assert.ok(typeof(actual) == 'object', 'expected ' + util.inspect(actual) + ' to be an object');
	    
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
	    assert.deepEqual(expected, actual, 'in ' + util.inspect(originalActual) + ', ' + key + ' ' + util.inspect(actual) + ' should be equal to ' + util.inspect(expected));
	  }
	};
	
	assert.doesntParse = function (obj) {
		assert.strictEqual(obj, null);
	};
	
	var parse = function (parser, source, index, context) {
	  index = (index || 0);
	  context = (context || {});
	  
	  var result;
	  
	  parser(source, index, context, shouldCall(function (r) {
	    result = r;
	  }));
	  
	  return result;
	}
	
	spec('integer', function () {
  	spec('parses integer', function () {
  		assert.containsFields(parse(integer, '8'), {integer: 8, index: 1});
  	});

  	spec('parses big integer', function () {
  		assert.containsFields(parse(integer, '888'), {integer: 888, index: 3});
  	});

  	spec("doesn't parse identifier", function () {
  		assert.doesntParse(parse(integer, 'id'));
  	});

  	spec("parses integer followed by id", function () {
  		assert.containsFields(parse(integer, '8 id'), {integer: 8, index: 1});
  	});

  	spec("parses integer within source", function () {
		  assert.containsFields(parse(integer, 'id 8', 3), {integer: 8, index: 4});
  	});

  	spec("doesn't parse integer within source", function () {
  		assert.doesntParse(parse(integer, 'id id 8', 3));
  	});

  	spec("parses one integer from many in source", function () {
  		assert.containsFields(parse(integer, 'id 1 2 3 4 5 6 7 8', 9), {integer: 4, index: 10});
  	});
	});
	
	spec('identifier parses identifier', function () {
    spec('parses identifier', function () {
      assert.containsFields(parse(identifier, 'one two tHrEe four five', 8), {identifier: 'tHrEe', index: 13});
    });
    
    spec('parses identifier with leading spaces', function () {
      assert.containsFields(parse(identifier, ' one'), {identifier: 'one', index: 4});
    });
	});
	
	spec('whitespace', function () {
    spec('parses some whitespace', function () {
      assert.containsFields(parse(whitespace, '   one'), {index: 3});
    });
    
    spec('even parses no whitespace', function () {
      assert.containsFields(parse(whitespace, 'one'), {index: 0});
    });
	});
	
	spec('float', function () {
  	spec('parses floats', function () {
  		assert.containsFields(parse(float, '5.6'), {float: 5.6, index: 3});
  	});

  	spec("doesn't parse floats", function () {
  		spec("that terminate immediately after the point", function() {
			  assert.doesntParse(parse(float, '5.'));
  		});

  		spec("that don't have digits after the point", function() {
			  assert.doesntParse(parse(float, '5.d'));
  		});

  		spec("that are just integers", function() {
			  assert.doesntParse(parse(float, '5'));
  		});
  	});
	});
	
	spec('keyword', function () {
	  spec('parses keywords', function () {
	    assert.containsFields(parse(keyword('object'), 'object'), {keyword: 'object', index: 6});
	  });
	});
	
	spec('sequence', function () {
    var seq = sequence(
        'type',
        ['name', identifier],
        keyword('to'),
        ['id', integer]);

  	spec('parses correct sequences', function () {
      assert.containsFields(parse(seq, 'tank to 8'), {index: 9, termName: 'type', name: {identifier: 'tank', index: 4}, id: {integer: 8, index: 9}});
    });

    spec('should not parse sequence', function () {
      assert.doesntParse(parse(seq, '9 to tank'));
    });
	});
	
	spec('choice (float or identifier)', function () {
	  var floatOrIdentifier = choice(float, identifier);
    
    spec('parses float', function () {
      assert.containsFields(parse(floatOrIdentifier, '78.4'), {index: 4, float: 78.4});
    });
    
    spec('parses identifier', function () {
      assert.containsFields(parse(floatOrIdentifier, 'xxy'), {index: 3, identifier: 'xxy'});
    });
    
    spec("doesn't parse integer", function () {
      assert.doesntParse(parse(floatOrIdentifier, '45'));
    });
	});
});
