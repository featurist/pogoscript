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
    var args = _.toArray(arguments);
    
    var createTerm = _.last(args);
    
    args = args.splice(0, args.length - 1);
    
    var subterms = _.map(args, function (subtermArgument) {
      return readSubTerm(subtermArgument);
    });
    
    return function (source, startIndex, context, continuation) {
      var term = {index: startIndex};
      
      var parseSubTerm = function (subtermIndex, index, context) {
        var subterm = subterms[subtermIndex];
        if (subterm) {
          subterm.parser(source, index, context, nextSubTermParser(subterm, subtermIndex + 1));
        } else {
          term.index = index;
          term.context = context;
          context.success(transformWith(term, createTerm), continuation);
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

var parsePartial = function (parser, source, index, context) {
  return parse(parser, source, index, context, true);
};

var parse = function (parser, source, index, context, partial) {
  memotable.clear();
  index = (index || 0);
  context = (context || createContext());
  
  var result = null;
  
  parser(source, index, context, function (r) {
    if (partial || (r && (r.index == source.length))) {
      result = r;
    }
  });
  
  return result;
}

var optional = function (parser) {
  return multiple(parser, 0, 1);
};

var multiple = function (parser, min, max) {
  return delimited(parser, undefined, min, max);
};

var delimited = function (parser, delimiter, min, max) {
  if (_.isUndefined(min)) {
    min = 1;
  }
  
  return function (source, index, context, continuation) {
    var terms = [];
    terms.context = context;
    terms.index = index;
    
    var parseWithResult = function (result) {
      parser(source, result.index, result.context, parseAnother);
    };
    
    var finishParsing = function () {
      if (terms.length >= min) {
        terms.context.success(terms, continuation);
      } else {
        context.failure(continuation);
      }
    };

    var parseAnother = function (result) {
      if (result) {
        terms.push(result);
        terms.context = result.context;
        terms.index = result.index;
        
        if (max && terms.length >= max) {
          result.context.success(terms, continuation);
        } else {
          if (delimiter) {
            delimiter(source, result.index, result.context, function (delimResult) {
              if (delimResult) {
                parseWithResult(delimResult);
              } else {
                finishParsing();
              }
            });
          } else {
            parseWithResult(result);
          }
        }
      } else {
        finishParsing();
      }
    };
    
    parser(source, index, context, parseAnother);
  };
};

var transformWith = function (term, transformer) {
  if (transformer) {
    return termDerivedFrom(term, transformer(term));
  } else {
    return term;
  }
};

var termDerivedFrom = function (baseTerm, derivedTerm) {
  if (derivedTerm) {
    derivedTerm.index = baseTerm.index;
    derivedTerm.context = baseTerm.context;
  }
  return derivedTerm;
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

var extractName = function (terminals) {
  return _(terminals).filter(function (terminal) {
    return terminal.identifier;
  }).map(function (identifier) {
    return identifier.identifier;
  });
};

var functionCall = transform(multipleTerminals, function (terminals) {
  var allIdentifiers = _(terminals).all(function (terminal) {
    return terminal.identifier;
  });
  
  if (allIdentifiers) {
    var name = _(terminals).map(function (terminal) {
      return terminal.identifier;
    });
    
    return terms.variable(name);
  }
  
  if (terminals.length == 1) {
    return terminals[0];
  }
  
  var isNoArgCall = terminals[terminals.length - 1].noArgumentFunctionCallSuffix;
  
  var name = extractName(terminals);
  
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

var methodCall = sequence(keyword(':'), ['methodCall', functionCall], function (term) {
  term.makeExpression = function (expression) {
    if (this.methodCall.isFunctionCall) {
      return terms.methodCall(expression, this.methodCall.function.variable, term.methodCall.arguments);
    } else if (this.methodCall.isVariable) {
      return terms.fieldReference(expression, this.methodCall.variable);
    } else {
      return terms.indexer(expression, this.methodCall);
    }
  };
  return term;
});

var expressionSuffix = choice(methodCall);

var primaryExpression = choice(functionCall);

var expression = sequence(['expression', primaryExpression], ['suffix', multiple(expressionSuffix, 0)], function (term) {
  if (term.suffix.length > 0) {
    var expr = term.expression;
    _(term.suffix).each(function (suffix) {
      expr = termDerivedFrom(suffix, suffix.makeExpression(expr));
    });
    return expr;
  } else {
    return term.expression;
  }
});

var definition = sequence(['target', multiple(choice(identifier, parameter))], keyword('='), ['source', expression], function (term) {
  var parms = _(term.target).filter(function (targetSegment) {
    return targetSegment.parameter;
  });
  
  var source = term.source;
  if (parms.length > 0) {
    if (!source.isBlock) {
      source = terms.block(parms, source);
    } else {
      source.parameters = parms;
    }
  }
  
  return terms.definition(terms.variable(extractName(term.target)), source);
});

primaryExpression.choices.unshift(definition);

var statements = sequence(multiple(keyword('\n'), 0), ['statements', delimited(expression, multiple(keyword('\n')))], multiple(keyword('\n'), 0), function (term) {
  return terms.statements(term.statements);
});

var _module = transform(statements, function (stmts) {
  return terms.module(stmts);
});

var subExpression = sequence(keyword('('), ['expression', expression], keyword(')'), function (term) {
  return term.expression;
});
terminal.choices.push(subExpression);

var block = sequence(keyword('{'), ['body', statements], keyword('}'), function (term) {
  return terms.block([], term.body);
});

terminal.choices.push(block);

exports.integer = integer;
exports.parse = parse;
exports.parsePartial = parsePartial;
exports.float = float;
exports.choice = choice;
exports.keyword = keyword;
exports.sequence = sequence;
exports.identifier = identifier;
exports.whitespace = whitespace;
exports.terminal = terminal;
exports.expression = expression;
exports.multiple = multiple;
exports.optional = optional;
exports.transform = transform;
exports.delimited = delimited;
exports.statements = statements;
exports.module = _module;