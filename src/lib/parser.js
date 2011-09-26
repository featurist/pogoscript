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
        if (!parseResult.isError) {
          continuation.success(parseResult);
        } else {
          continuation.failure(parseResult);
        }
      } else {
        parser(source, index, context, continuation.on({
          success: function (parseResult) {
            if (!parseResult.dontMemoise) {
              memo.table[index] = parseResult;
            }
            continuation.success(parseResult);
          },
          failure: function (error) {
            memo.table[index] = error;
            continuation.failure(error);
          }
        }));
      }
    };
  };
};

var memotable = new MemoTable();

var ErrorLog = function () {
  var errorWithLargestIndex;
  var expected = [];
  
  this.addError = function (error) {
    if (!errorWithLargestIndex || error.index > errorWithLargestIndex.index) {
      errorWithLargestIndex = error;
    }
  };
  
  this.error = function() {
    return errorWithLargestIndex;
  };
};

var Continuation = function (errorLog, parent, handler) {
  this.onSuccess = function (f) {
    return new Continuation(errorLog, this, {success: f});
  };
  
  this.onFailure = function (f) {
    return new Continuation(errorLog, this, {failure: f});
  };
  
  this.on = function (o) {
    return new Continuation(errorLog, this, o);
  };
  
  this.success = function (result) {
    if (handler.success) {
      handler.success(result);
    } else {
      parent.success(result);
    }
  };
  
  this.failure = function (error) {
    if (!error.stack) {
      error.stack = new Error().stack;
    }
    error.isError = true;
    
    errorLog.addError(error);
    
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
  
var nameParser = function (name, parser) {
  parser.parserName = name;
  return parser;
};

var createParser = function (name, originalRe, createTerm, dontIgnoreWhitespace) {
  var ignoreCaseFlag = originalRe.ignoreCase? 'i': '';
  
  var re = new RegExp(originalRe.source, 'g' + ignoreCaseFlag);
  var parser = memotable.memoise(function (source, index, context, continuation) {
    re.lastIndex = index;
    var match = re.exec(source);
    if (match && match.index == index) {
      var term = createTerm.apply(undefined, match);
      if (term) {
        term.index = re.lastIndex;
        term.context = context;
        continuation.success(term);
      } else {
        continuation.failure({expected: [parser], index: index, context: context});
      }
    } else {
      continuation.failure({expected: [parser], index: index, context: context});
    }
  });
  
  if (dontIgnoreWhitespace) {
    return nameParser(name, parser);
  } else {
    return parser = nameParser(name, ignoreLeadingWhitespace(parser));
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
          transformWith(term, createTerm, continuation);
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

var identifierRegExp = /[a-z+\/*_<>=-][a-z0-9+\/*_<>=-]*/i;

var identifier = createParser(
  'identifier',
  identifierRegExp,
  function (id) {
    if (id != '=')
      return terms.identifier(id);
  }
);

var string = exports.string = createParser(
  'string',
  /'(([^']*'')*[^']*)'/,
  function(wholeMatch, str) {
    return terms.string(str.replace("''", "'"));
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

var unindentation = createParser(
  'indentation',
  /[ \t\n]*\n([ \t]*)/,
  function (match, i) {
    thingo++;
    return {indentation: i, dontMemoise: true};
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
      continuation.success(result);
    } else {
      continuation.failure({index: index, context: context});
    }
  }));
});

var unindent = exports.unindent = memotable.memoise(function(source, index, context, continuation) {
  if (source.length == index) {
    if (!_.isUndefined(context.previousIndentation())) {
      var newContext = context.oldIndentation();
      continuation.success({index: index, context: newContext, dontMemoise: true});
    } else {
      continuation.failure({index: index, context: context});
    }
  } else {
    unindentation(source, index, context, continuation.onSuccess(function (result) {
      if (!context.containsIndentation(result.indentation)) {
        continuation.failure({index: index, context: context});
      } else {
        if (context.previousIndentation() != result.indentation) {
          result.index = index;
          result.dontMemoise = true;
          result.context = result.context.oldIndentation();
          result.context.stuff = true;
          continuation.success(result);
        } else {
          indentationForNextLineOnly(source, index, context, continuation.onSuccess(function (shortResult) {
            shortResult.context = shortResult.context.oldIndentation();
            continuation.success(shortResult);
          }));
        }
      }
    }));
  }
});

var noindent = exports.noindent = nameParser('new line', memotable.memoise(function(source, index, context, continuation){
  indentation(source, index, context, continuation.onSuccess(function (result) {
    if (result.indentation == context.indentation) {
      continuation.success(result);
    } else {
      continuation.failure({index: index, context: context});
    }
  }));
}));

var startResetIndent = exports.startResetIndent = memotable.memoise(function(source, index, context, continuation){
  choice(indentation, whitespaceIncludingNewlines) (source, index, context, continuation.onSuccess(function (result) {
    if (result.indentation) {
      result.context = context.withIndentation(result.indentation);
    }
    continuation.success(result);
  }));
});

var endResetIndent = exports.endResetIndent = memotable.memoise(function(source, index, context, continuation){
  whitespaceIncludingNewlines(source, index, context, continuation.onSuccess(function (result) {
    result.context = context.oldIndentation(result.indentation);
    continuation.success(result);
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
    new RegExp('\\' + sigil + '(' + identifierRegExp.source + ')', 'i'),
    function (match, identifier) {
      return createTerm(identifier);
    }
  );
};

var escapeInRegExp = function (str) {
  if (/^[(){}?.+*\[\]]$/.test(str)) {
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
        choiceParser(source, index, context, continuation.onFailure(parseNextChoice(choiceIndex + 1)));
      } else {
        if (parseAllChoices.choices.length == 2) {
        }
        continuation.failure({index: index, context: context, expected: parseAllChoices.choices});
      }
    };
    
    var parseNextChoice = function (choiceIndex) {
      return function () {
        parseChoice(choiceIndex);
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

var parse = exports.parse = function (parser, source, index, context, partial) {
  var result = null;
  
  tryParse(parser, source, {
    success: function (r) {
      result = r;
    },
    failure: function (error) {
    }
  }, index, context, partial);
  
  return result;
};

var tryParseError = exports.tryParseError = function (parser, source) {
  var error = null;
  
  tryParse(parser, source, {
    failure: function (e) {
      error = e;
    }
  });
  
  return error;
};

var tryParse = exports.tryParse = function (parser, source, handler, index, context, partial) {
  memotable.clear();
  index = (index || 0);
  context = context || new Context();
  
  var everythingParser = transform(parser, function(term) {
    if (partial || (term && (term.index == source.length))) {
      return term;
    } else {
      throw terms.parseError(term, 'did not parse whole file');
    }
  });
  
  var errorLog = new ErrorLog();
  
  everythingParser(source, index, context, new Continuation(errorLog).on({
    failure: function (error) {
      handler.failure(errorLog.error());
    },
    success: function (r) {
      handler.success(r);
    }
  }));
};

var parseModule = exports.parseModule = function (source, handler) {
  tryParse(_module, source, handler, 0, undefined, undefined);
};

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
    
    var finishParsing = function (error) {
      if (terms.length >= min) {
        continuation.success(terms);
      } else {
        continuation.failure(error);
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
        continuation.success(terms);
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

var transformWith = function (term, transformer, continuation) {
  var transformedTerm;
  try {
    transformedTerm = termDerivedFrom(term, transformer(term));
  } catch (e) {
    continuation.failure(e);
  }
  
  if (transformedTerm) {
    continuation.success(transformedTerm);
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
      transformWith(result, transformer, continuation);
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

var terminal = nameParser('terminal', choice(integer, float, argument, identifier, parameter, string, noArgumentFunctionCallSuffix));

var basicExpression = transform(multiple(terminal), function(terminals) {
  return terms.basicExpression(terminals);
});

var functionCall = nameParser('function call', transform(basicExpression, function (basicExpression) {
  return basicExpression.expression();
}));

var identityTransform = exports.identityTransform = function (term) {
  return term;
};

var expression = nameParser('expression', choice());

var methodCall = nameParser('method call', sequence(keyword(':'), ['methodCall', basicExpression], ['assignmentSource', optional(sequence(keyword('='), ['expression', expression], identityTransform))], function (term) {
  term.makeExpression = function (expression) {
    if (this.assignmentSource[0]) {
      var source = this.assignmentSource[0].expression;
      
      return this.methodCall.objectDefinitionTarget(expression, source);
    } else {
      var objectOperator = this.methodCall.expression();
      
      if (objectOperator.isFunctionCall) {
        return terms.methodCall(expression, objectOperator.function.variable, objectOperator.arguments);
      } else if (objectOperator.isVariable) {
        return terms.fieldReference(expression, objectOperator.variable);
      } else {
        return terms.indexer(expression, objectOperator);
      }
    }
  };
  return term;
}));

var expressionSuffix = nameParser('expression suffix', choice(methodCall));

var primaryExpression = nameParser('primary expression', choice(functionCall));

var fullExpression = sequence(['expression', primaryExpression], ['suffix', multiple(expressionSuffix, 0)], function (term) {
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

expression.choices.push(fullExpression);

var definition = nameParser('definition', sequence(['target', basicExpression], keyword('='), ['source', expression], function (term) {
  return term.target.definitionTarget(term.source);
}));

primaryExpression.choices.unshift(definition);

var statementTerminator = nameParser('statement terminator', choice(noindent, keyword('.')));
var startBlock = nameParser('start block', choice(sequence(keyword('{'), startResetIndent, identityTransform), indent));
var endBlock = nameParser('end block', choice(sequence(endResetIndent, keyword('}'), identityTransform), unindent));

var statements = nameParser('statements', sequence(['statements', delimited(expression, multiple(statementTerminator), 0)], function (term) {
  return terms.statements(term.statements);
}));

var _module = nameParser('module', transform(sequence(startResetIndent, ['statements', statements], endResetIndent, identityTransform), function (stmts) {
  return terms.module(stmts.statements);
}));

var subExpression = nameParser('sub expression', sequence(keyword('('), ['expression', expression], keyword(')'), function (term) {
  return term.expression;
}));
terminal.choices.push(subExpression);

var block = nameParser('block', sequence(startBlock, ['body', statements], endBlock, function (term) {
  return terms.block([], term.body);
}));

terminal.choices.push(block);

var list = nameParser('list', sequence(sequence(keyword('['), startResetIndent, identityTransform), ['items', delimited(expression, choice(keyword(','), statementTerminator), 0)], sequence(endResetIndent, keyword(']'), identityTransform), function(term) {
  return terms.list.call(terms.list, term.items);
}));

terminal.choices.push(list);

var hash = nameParser('hash', sequence(sequence(keyword('#'), startBlock, identityTransform), ['entries', delimited(basicExpression, choice(keyword(','), statementTerminator), 0)], endBlock, function(term) {
  var entries = _.map(term.entries, function(e) {
    return e.hashEntry();
  });
  return terms.hash.call(terms.hash, entries);
}));

terminal.choices.push(hash);

exports.integer = integer;
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
exports.block = block;