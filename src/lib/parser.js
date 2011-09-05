var _ = require('underscore');

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
        if (parseResult) {
          parseResult.context.success(parseResult, continuation);
        } else {
          context.failure(continuation);
        }
      } else {
        parser(source, index, context, function (parseResult) {
          memo.table[index] = parseResult;
          if (parseResult) {
            parseResult.context.success(parseResult, continuation);
          } else {
            context.failure(continuation);
          }
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
      context.success(term, continuation);
    } else {
      context.failure(continuation);
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
          context.success(term, continuation);
        }
      };
      
      var nextSubTermParser = function (previousSubterm, subtermIndex) {
        return function (result) {
          if (result) {
            previousSubterm.addToTerm(term, result);
            parseSubTerm(subtermIndex, result.index, result.context);
          } else {
            context.failure(continuation);
          }
        };
      };
      
      parseSubTerm(0, startIndex, context);
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
        context.failure(continuation);
      }
    };
    
    var parseNextChoice = function (choiceIndex) {
      return function (result) {
        if (result) {
          result.context.success(result, continuation);
        } else {
          parseChoice(choiceIndex);
        } 
      }
    };
    
    parseChoice(0);
  };
};
  
var createContext = function () {
  return {
    success: function (result, continuation) {
      continuation(result);
    },
    failure: function (continuation) {
      continuation(null);
    }
  };
}

var parse = function (parser, source, index, context) {
  memotable.clear();
  index = (index || 0);
  context = (context || createContext());
  
  var result;
  
  parser(source, index, context, shouldCall(function (r) {
    result = r;
  }));
  
  return result;
}

exports.integer = integer;
exports.parse = parse;
exports.float = float;
exports.choice = choice;
exports.keyword = keyword;
exports.sequence = sequence;
exports.identifier = identifier;
exports.whitespace = whitespace;