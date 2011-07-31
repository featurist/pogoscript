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
	                continuation(parseResult);
	            } else {
  	            parser(source, index, function (parseResult) {
  	              memo.table[index] = parseResult;
  	              continuation(parseResult);
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
	
	var createParser = function (name, originalRe, createTerm, ignoreWhitespace) {
		var ignoreCaseFlag = originalRe.ignoreCase? 'i': '';
		
		var re = new RegExp(originalRe.source, 'g' + ignoreCaseFlag);
		var parser = memotable.memoise(function (source, index, continuation) {
			re.lastIndex = index;
			var match = re.exec(source);
			if (match && match.index == index) {
				var term = createTerm(match[0]);
				term.index = re.lastIndex;
				continuation(term);
			} else {
				continuation(null);
			}
		});
		
		var nameParser = function (parser) {
		  parser.parserName = name;
		  return parser;
		};
		
		if (ignoreWhitespace) {
		  return nameParser(ignoreLeadingWhitespace(parser));
		} else {
  		return nameParser(parser);
  	}
	};
	
  var sequence = function () {
    var termType = arguments[0];
    var namedParsers = [];
    for (var n = 1; n < arguments.length; n++) {
      namedParsers.push(arguments[n]);
    }
    
    return function (source, index, continuation) {
      var result = {};

      if (namedParsers.length > 0) {
        for (var i = 0; i < namedParsers.length; i++) {
          var namedParser = namedParsers[i];
          
          var name;
          var parser;
          if (_.isArray(namedParser)) {
            name = namedParser[0];
            parser = namedParser[1];
          } else {
            parser = namedParser;
            name = null;
          }

          var parseResult = parser(source, index);
          if (parseResult) {
            index = parseResult.index;
            if (name) {
              result[name] = parseResult;
            }
          } else {
            continuation(null);
            return;
          }
        }
      } else {
        continuation(null);
        return;
      }

      result.termType = termType;
      result.index = index;
      continuation(result);
    };
  };
	
	var integer = createParser(
	  'integer',
		/\d+/,
		function (match) {
			return {integer: parseInt(match)};
		},
		true
	);
	
	var float = createParser(
	  'float',
		/\d+\.\d+/,
		function (match) {
			return {float: parseFloat(match)};
		},
		true
	);
	
	var whitespace = createParser(
	  'whitespace',
	  /[ \t]*/,
	  function (match) {
	    return {};
	  }
	);
	
	var identifier = createParser(
	  'identifier',
		/[a-z]+/i,
		function (match) {
			return {identifier: match};
		},
		true
	);
	
	var keyword = function (kw) {
	  return createParser(
	    'keyword ' + kw,
  	  new RegExp(kw),
  	  function (match) {
  	    return {keyword: match};
      },
      true
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
        assert.containsFields(result, {index: 9, termType: 'type', name: {identifier: 'tank', index: 4}, id: {integer: 8, index: 9}});
      }));
    });

    spec('should not parse sequence', function () {
        seq('9 to tank', 0, shouldCall(function (result) {
          assert.doesntParse(result);
        }));
    });
	});
});
