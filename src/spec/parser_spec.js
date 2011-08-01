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
      return function (source, index, continuation) {
        var parseResult = memo.table[index];
        if (parseResult) {
          success(parseResult, continuation);
        } else {
          parser(source, index, function (parseResult) {
            memo.table[index] = parseResult;
            success(parseResult, continuation);
          });
        }
      };
    };
  };
	
	var memotable = new MemoTable();
	
	var ignoreLeadingWhitespace = function (parser) {
    return function (source, index, continuation) {
      whitespace(source, index, function (parsedWhitespace) {
        parser(source, parsedWhitespace.index, continuation);
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
		var parser = memotable.memoise(function (source, index, continuation) {
			re.lastIndex = index;
			var match = re.exec(source);
			if (match && match.index == index) {
				var term = createTerm(match[0]);
				term.index = re.lastIndex;
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
      
      return function (source, startIndex, continuation) {
        var term = {termName: termName, index: startIndex};
        
        var parseSubTerm = function (subtermIndex, index, nextSubtermIndex) {
          var subterm = subterms[subtermIndex];
          if (subterm) {
            subterm.parser(source, index, nextSubTermParser(subterm, subtermIndex + 1));
          } else {
            term.index = index;
            success(term, continuation);
          }
        };
        
        var nextSubTermParser = function (previousSubterm, subtermIndex) {
          return function (result) {
            if (result) {
              previousSubterm.addToTerm(term, result);
              parseSubTerm(subtermIndex, result.index);
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
	
	assert.containsFields = function (term, fields) {
		for (var name in fields) {
			assert.deepEqual(fields[name], term[name], 'term ' + util.inspect(term) + ' should contain field: ' + name + ' == ' + util.inspect(fields[name]));
		}
	};
	
	assert.doesntParse = function (obj) {
		assert.strictEqual(obj, null);
	};
	
	spec('integer', function () {
  	spec('parses integer', function () {
  	  integer('8', 0, function (result) {
    		assert.containsFields(result, {integer: 8, index: 1});
  	  });
  	});

  	spec('parses big integer', function () {
  	  integer('888', 0, function (result) {
    		assert.containsFields(result, {integer: 888, index: 3});
  	  });
  	});

  	spec("doesn't parse identifier", function () {
  	  integer('id', 0, function (result) {
    		assert.doesntParse(result);
  		});
  	});

  	spec("parses integer followed by id", function () {
  	  integer('8 id', 0, function (result) {
    		assert.containsFields(result, {integer: 8, index: 1});
  	  });
  	});

  	spec("parses integer within source", function () {
  	  integer('id 8', 3, function (result) {
  		  assert.containsFields(result, {integer: 8, index: 4});
		  });
  	});

  	spec("doesn't parse integer within source", function () {
  	  integer('id id 8', 3, shouldCall(function (result) {
    		assert.doesntParse(result);
  	  }));
  	});

  	spec("parses one integer from many in source", function () {
  	  integer('id 1 2 3 4 5 6 7 8', 9, function (result) {
    		assert.containsFields(result, {integer: 4, index: 10});
  	  });
  	});
	});
	
	spec('identifier parses identifier', function () {
    spec('parses identifier', function () {
      identifier('one two tHrEe four five', 8, shouldCall(function (result) {
        assert.containsFields(result, {identifier: 'tHrEe', index: 13});
      }));
    });
    
    spec('parses identifier with leading spaces', function () {
      identifier(' one', 0, shouldCall(function (result) {
        assert.containsFields(result, {identifier: 'one', index: 4});
      }));
    });
	});
	
	spec('whitespace', function () {
    spec('parses some whitespace', function () {
      whitespace('   one', 0, shouldCall(function (result) {
        assert.containsFields(result, {index: 3});
      }));
    });
    
    spec('even parses no whitespace', function () {
      whitespace('one', 0, shouldCall(function (result) {
        assert.containsFields(result, {index: 0});
      }));
    });
	});
	
	spec('float', function () {
  	spec('parses floats', function () {
  	  float('5.6', 0, shouldCall(function (result) {
    		assert.containsFields(result, {float: 5.6, index: 3});
  		}));
  	});

  	spec("doesn't parse floats", function () {
  		spec("that terminate immediately after the point", function() {
  			float('5.', 0, shouldCall(function (result) {
  			  assert.doesntParse(result);
  			}));
  		});

  		spec("that don't have digits after the point", function() {
  			float('5.d', 0, shouldCall(function (result) {
  			  assert.doesntParse(result);
  			}));
  		});

  		spec("that are just integers", function() {
  			float('5', 0, shouldCall(function (result) {
  			  assert.doesntParse(result);
  			}));
  		});
  	});
	});
	
	spec('keyword', function () {
	  spec('parses keywords', function () {
	    keyword('object')('object', 0, function (result) {
  	    assert.containsFields(result, {keyword: 'object', index: 6});
      });
	  });
	});
	
	spec('sequence', function () {
    var seq = sequence(
        'type',
        ['name', identifier],
        keyword('to'),
        ['id', integer]);

  	spec('parses correct sequences', function () {
      seq('tank to 8', 0, shouldCall(function (result) {
        assert.containsFields(result, {index: 9, termName: 'type', name: {identifier: 'tank', index: 4}, id: {integer: 8, index: 9}});
      }));
    });

    spec('should not parse sequence', function () {
        seq('9 to tank', 0, shouldCall(function (result) {
          assert.doesntParse(result);
        }));
    });
	});
});
