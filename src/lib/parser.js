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
      if (!_.isUndefined(parseResult)) {
        if (parseResult) {
          parseResult.context.success(parseResult, continuation);
        } else {
          context.failure(continuation);
        }
      } else {
        parser(source, index, context, continuation.on({
          success: function (parseResult) {
            if (!parseResult.dontMemoise) {
              memo.table[index] = parseResult;
            }
            parseResult.context.success(parseResult, continuation);
          },
          failure: function (error) {
            memo.table[index] = null;
            context.failure(continuation);
          }
        }));
      }
    };
  };
};

var memotable = new MemoTable();

var Continuation = function (parent, handler) {
  this.onSuccess = function (f) {
    return new Continuation(this, {success: f});
  };
  
  this.onFailure = function (f) {
    return new Continuation(this, {failure: f});
  };
  
  this.on = function (o) {
    return new Continuation(this, o);
  };
  
  this.success = function (result) {
    if (handler.success) {
      handler.success(result);
    } else {
      parent.success(result);
    }
  };
  
  this.failure = function (error) {
    if (handler.failure) {
      handler.failure(error);
    } else {
      parent.failure(error);
    }
  };
};

var ignoreLeadingWhitespace = function (parser) {
  return memotable.memoise(function (source, index, context, continuation) {
    whitespace(source, index, context, continuation.onSuccess(function (parsedWhitespace) {
      parser(source, parsedWhitespace.index, parsedWhitespace.context, continuation);
    }));
  });
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
    
    return memotable.memoise(function (source, startIndex, context, continuation) {
      var term = {index: startIndex};
      
      var parseSubTerm = function (subtermIndex, index, context) {
        var subterm = subterms[subtermIndex];
        if (subterm) {
          subterm.parser(source, index, context, continuation.onSuccess(nextSubTermParser(subterm, subtermIndex + 1)));
        } else {
          term.index = index;
          term.context = context;
          context.success(transformWith(term, createTerm), continuation);
        }
      };
      
      var nextSubTermParser = function (previousSubterm, subtermIndex) {
        return function (result) {
          previousSubterm.addToTerm(term, result);
          parseSubTerm(subtermIndex, result.index, result.context);
        };
      };
      
      parseSubTerm(0, startIndex, context);
    });
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

var whitespaceIncludingNewlines = createParser(
  'whitespaceIncludingNewlines',
  /[ \t\n]*/,
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

var indentation = createParser(
  'indentation',
  /[ \t\n]*\n([ \t]*)/,
  function (match, i) {
    return {indentation: i};
  }
);

var thingo = 0;

var indentationNoMemoise = createParser(
  'indentation',
  /[ \t\n]*\n([ \t]*)/,
  function (match, i) {
    thingo++;
    return {indentation: i, dontMemoise: true, thingo: thingo};
  },
  true
);

var indentationForNextLineOnly = createParser(
  'indentation',
  /\n([ \t]*)/,
  function (match, i) {
    return {indentation: i};
  }
);

var stringStartsWith = function (bigString, toStartWith) {
  return (bigString.length > toStartWith.length) && (bigString.substring(0, toStartWith.length) == toStartWith);
};

var indent = exports.indent = memotable.memoise(function(source, index, context, continuation) {
  indentation(source, index, context, continuation.onSuccess(function (result) {
    if (stringStartsWith(result.indentation, context.indentation)) {
      result.context = result.context.withIndentation(result.indentation);
      result.context.success(result, continuation);
    } else {
      context.failure(continuation);
    }
  }));
});

var unindent = exports.unindent = memotable.memoise(function(source, index, context, continuation) {
  indentationNoMemoise(source, index, context, continuation.onSuccess(function (result) {
    if (!context.containsIndentation(result.indentation)) {
      context.failure(continuation);
    } else {
      if (context.previousIndentation() != result.indentation) {
        result.index = index;
        result.dontMemoise = true;
        result.context = result.context.oldIndentation();
        result.context.stuff = true;
        result.context.success(result, continuation);
      } else {
        indentationForNextLineOnly(source, index, context, continuation.onSuccess(function (shortResult) {
          shortResult.context = shortResult.context.oldIndentation();
          shortResult.context.success(shortResult, continuation);
        }));
      }
    }
  }));
});

var noindent = exports.noindent = memotable.memoise(function(source, index, context, continuation){
  indentation(source, index, context, continuation.onSuccess(function (result) {
    if (result.indentation == context.indentation) {
      result.context.success(result, continuation);
    } else {
      context.failure(continuation);
    }
  }));
});

var startResetIndent = exports.startResetIndent = memotable.memoise(function(source, index, context, continuation){
  choice(indentation, whitespaceIncludingNewlines) (source, index, context, continuation.onSuccess(function (result) {
    if (result.indentation) {
      result.context = context.withIndentation(result.indentation);
    }
    result.context.success(result, continuation);
  }));
});

var endResetIndent = exports.endResetIndent = memotable.memoise(function(source, index, context, continuation){
  whitespaceIncludingNewlines(source, index, context, continuation.onSuccess(function (result) {
    result.context = context.oldIndentation(result.indentation);
    result.context.success(result, continuation);
  }));
});

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
  if (/^[(){}?.]$/.test(str)) {
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
  var parseAllChoices = memotable.memoise(function (source, index, context, continuation) {
    var parseChoice = function (choiceIndex) {
      var choiceParser = parseAllChoices.choices[choiceIndex];

      if (choiceParser) {
        choiceParser(source, index, context, continuation.on(parseNextChoice(choiceIndex + 1)));
      } else {
        context.failure(continuation);
      }
    };
    
    var parseNextChoice = function (choiceIndex) {
      return {
        success: function (result) {
          result.context.success(result, continuation);
        },
        failure: function (error) {
          parseChoice(choiceIndex);
        }
      };
    };
    
    parseChoice(0);
  });
  
  parseAllChoices.choices = Array.prototype.slice.call(arguments);
  
  return parseAllChoices;
};
  
var Context = exports.Context = function () {
  this.previousIndentations = [];
  this.indentation = '';
  
  this.success = function (result, continuation) {
    continuation.success(result);
  };
  
  this.failure = function (continuation) {
    continuation.failure({error: 'error'});
  };
  
  this.withIndentation = function (indentation) {
    var newContext = new Context();
    newContext.indentation = indentation;
    newContext.previousIndentations = this.previousIndentations.slice();
    newContext.previousIndentations.unshift(this.indentation);
    return newContext;
  };
  
  this.containsIndentation = function (indentation) {
    return _.contains(this.previousIndentations, indentation);
  };
  
  this.oldIndentation = function () {
    var context = new Context();
    context.indentation = this.previousIndentations[0];
    context.previousIndentations = this.previousIndentations.slice(1);
    return context;
  };
  
  this.previousIndentation = function () {
    return this.previousIndentations[0];
  };
};

var parsePartial = function (parser, source, index, context) {
  return parse(parser, source, index, context, true);
};

var parse = function (parser, source, index, context, partial) {
  memotable.clear();
  index = (index || 0);
  context = context || new Context();
  
  var result = null;
  
  parser(source, index, context, new Continuation().on({
    failure: function (error) {
    },
    success: function (r) {
      if (partial || (r && (r.index == source.length))) {
        result = r;
      }
    }
  }));
  
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
  
  return memotable.memoise(function (source, index, context, continuation) {
    var terms = [];
    terms.context = context;
    terms.index = index;
    
    var finishParsing = function () {
      if (terms.length >= min) {
        terms.context.success(terms, continuation);
      } else {
        context.failure(continuation);
      }
    };
    
    var parseWithResult = function (result) {
      parser(source, result.index, result.context, continuation.onSuccess(parseAnother).onFailure(finishParsing));
    };

    var parseAnother = function (result) {
      terms.push(result);
      terms.context = result.context;
      terms.index = result.index;
      
      if (max && terms.length >= max) {
        result.context.success(terms, continuation);
      } else {
        if (delimiter) {
          delimiter(source, result.index, result.context, continuation.on({
            success: function (delimResult) {
              parseWithResult(delimResult);
            },
            failure: function(error) {
              finishParsing();
            }
          }));
        } else {
          parseWithResult(result);
        }
      }
    };
    
    parser(source, index, context, continuation.onSuccess(parseAnother).onFailure(finishParsing));
  });
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
    if (baseTerm.dontMemoise) {
      derivedTerm.dontMemoise = true;
    }
  }
  return derivedTerm;
};

var transform = function (parser, transformer) {
  return memotable.memoise(function (source, index, context, continuation) {
    parser(source, index, context, continuation.onSuccess(function (result) {
      var transformed = transformer(result);

      if (transformed) {
        transformed.index = result.index;
        transformed.context = result.context;
        context.success(transformed, continuation);
      } else {
        context.failure(continuation);
      }
    }));
  });
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

var multipleTerminals = transform(multiple(terminal), function(terminals) {
  return terms.basicExpression(terminals);
});

var extractName = function (terminals) {
  return _(terminals).filter(function (terminal) {
    return terminal.identifier;
  }).map(function (identifier) {
    return identifier.identifier;
  });
};

var functionCall = transform(multipleTerminals, function (expression) {
  var terminals = expression.terminals;
  expression.buildBlocks();
  
  var name = extractName(terminals);

  if (name.length == 0 && terminals.length > 1) {
    return terms.functionCall(terminals[0], terminals.splice(1));
  }

  var createMacro = terms.macros.findMacro(name);
  if (createMacro) {
    return createMacro(expression);
  }
  
  if (expression.isVariableExpression()) {
    return expression.variable();
  }
  
  if (expression.isTerminalExpression()) {
    return expression.terminal();
  }
  
  var isNoArgCall = expression.isNoArgumentFunctionCall();
  
  var arguments = expression.arguments();
  
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

var identityTransform = function (term) {
  return term;
};

var statementTerminator = choice(noindent, keyword('.'));
var startBlock = choice(sequence(keyword('{'), startResetIndent, identityTransform), indent);
var endBlock = choice(sequence(endResetIndent, keyword('}'), identityTransform), unindent);

var statements = sequence(['statements', delimited(expression, multiple(statementTerminator), 0)], function (term) {
  return terms.statements(term.statements);
});

var _module = transform(sequence(startResetIndent, ['statements', statements], endResetIndent, identityTransform), function (stmts) {
  return terms.module(stmts.statements);
});

var subExpression = sequence(keyword('('), ['expression', expression], keyword(')'), function (term) {
  return term.expression;
});
terminal.choices.push(subExpression);

var block = sequence(startBlock, ['body', statements], endBlock, function (term) {
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