var _ = require('underscore');
var terms = require('./codeGenerator');

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
      var term = createTerm.apply(undefined, match);
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
    return terms.integer(parseInt(match));
  }
);

var float = createParser(
  'float',
  /\d+\.\d+/,
  function (match) {
    return terms.float(parseFloat(match));
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
  /[a-z][a-z0-9]*/i,
  function (id) {
    return terms.identifier(id);
  }
);

var sigilIdentifier = function (sigil, name, createTerm) {
  createTerm = createTerm || function (identifier) {
    var term = {};
    term[name] = identifier;
    return term;
  };
  
  return createParser(
    name,
    new RegExp('\\' + sigil + '([a-z][a-z0-9]*)', 'i'),
    function (match, identifier) {
      return createTerm(identifier);
    }
  );
};

var escapeInRegExp = function (str) {
  if (/^[(){}?]$/.test(str)) {
    return '\\' + str;
  } else {
    return str;
  }
};

var keyword = function (kw) {
  return createParser(
    'keyword "' + kw + '"',
    new RegExp(escapeInRegExp(kw)),
    function (match) {
      return {keyword: match};
    }
  );
};

var choice = function () {
  var parseAllChoices = function (source, index, context, continuation) {
    var parseChoice = function (choiceIndex) {
      var choiceParser = parseAllChoices.choices[choiceIndex];

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
  
  parseAllChoices.choices = Array.prototype.slice.call(arguments);
  
  return parseAllChoices;
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
  
  parser(source, index, context, function (r) {
    result = r;
  });
  
  return result;
}

var multiple = function (parser, min, max) {
  return function (source, index, context, continuation) {
    var terms = [];

    var parseAnother = function (result) {
      if (result) {
        terms.push(result);
        terms.context = result.context;
        terms.index = result.index;
        
        if (max && terms.length >= max) {
          result.context.success(terms, continuation);
        } else {
          parser(source, result.index, result.context, parseAnother);
        }
      } else {
        if (!min || terms.length >= min) {
          context.success(terms, continuation);
        } else {
          context.failure(continuation);
        }
      }
    };
    
    parser(source, index, context, parseAnother);
  };
};

var transform = function (parser, transformer) {
  return function (source, index, context, continuation) {
    parser(source, index, context, function (result) {
      if (result) {
        var transformed = transformer(result);

        if (transformed) {
          transformed.index = result.index;
          transformed.context = result.context;
        }
        
        context.success(transformed, continuation);
      } else {
        context.failure(continuation);
      }
    })
  };
};

var argument = sigilIdentifier('@', 'argument', function (argumentName) {
  return terms.variable([argumentName]);
});

var parameter = sigilIdentifier('?', 'parameter', function (argumentName) {
  return terms.parameter([argumentName]);
});

var noArgumentFunctionCallSuffix = transform(keyword('!'), function (result) {
  return {
    noArgumentFunctionCallSuffix: true
  };
});

var terminal = choice(integer, float, argument, identifier, parameter, noArgumentFunctionCallSuffix);

var multipleTerminals = multiple(terminal);

var functionCall = transform(multipleTerminals, function (terminals) {
  var allIdentifiers = _(terminals).all(function (terminal) {
    return terminal.identifier;
  });
  
  if (allIdentifiers) {
    return null;
  }
  
  var isNoArgCall = terminals[terminals.length - 1].noArgumentFunctionCallSuffix;
  
  var name = _(terminals).filter(function (terminal) {
    return terminal.identifier;
  }).map(function (identifier) {
    return identifier.identifier;
  });
  
  var arguments = _(terminals).filter(function (terminal) {
    return !terminal.identifier && !terminal.noArgumentFunctionCallSuffix && !terminal.parameter;
  });
  
  var buildBlocks = function () {
    var parameters = [];
    
    _(terminals).each(function (terminal) {
      if (terminal.parameter) {
        parameters.push(terminal);
      } else if (terminal.body) {
        terminal.parameters = parameters;
        parameters = [];
      }
    });
  };
  
  buildBlocks();
  
  if (isNoArgCall && arguments.length > 0) {
    return null;
  }
  
  return terms.functionCall(terms.variable(name), arguments);
});

var variable = transform(multipleTerminals, function (terminals) {
  var allIdentifiers = _(terminals).all(function (terminal) {
    return terminal.identifier;
  });
  
  if (allIdentifiers) {
    var name = _(terminals).map(function (terminal) {
      return terminal.identifier;
    });
    
    return terms.variable(name);
  } else {
    return null;
  }
});

var expression = choice(functionCall, variable);

var subExpression = transform(sequence('subExpression', keyword('('), ['expression', expression], keyword(')')), function (term) {
  return term.expression;
});
terminal.choices.push(subExpression);

var block = transform(sequence('block', keyword('{'), ['body', expression], keyword('}')), function (term) {
  return terms.block([], term.body);
});

terminal.choices.push(block);


exports.integer = integer;
exports.parse = parse;
exports.float = float;
exports.choice = choice;
exports.keyword = keyword;
exports.sequence = sequence;
exports.identifier = identifier;
exports.whitespace = whitespace;
exports.terminal = terminal;
exports.expression = expression;
exports.multiple = multiple;
exports.transform = transform;