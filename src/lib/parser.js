var _ = require('underscore');
var terms = require('./codeGenerator');
var util = require('util');

var MemoTable = exports.MemoTable = function () {
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
    return function (source, index, context) {
      var parseResult = memo.table[index];
      if (parseResult && parseResult.previousContext === context) {
        return parseResult;
      } else {
        parseResult = parser(source, index, context);

        if (!(parseResult && parseResult.dontMemoise)) {
          parseResult.previousContext = context;
          memo.table[index] = parseResult;
        }
        
        return parseResult;
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
  return memotable.memoise(function (source, index, context) {
    var parsedWhitespace = whitespace(source, index, context);
    return parser(source, parsedWhitespace.index, parsedWhitespace.context);
  });
};
  
var nameParser = function (name, parser) {
  parser.parserName = name;
  return parser;
};

var ParseFailure = function(expected, index, context, message) {
  this.isError = true;
  this.expected = expected;
  this.index = index;
  this.context = context;
  this.message = message;
  
  this.printError = function (sourceFile) {
    process.stdout.write(this.message + '\n');
    process.stdout.write('\n');
    process.stderr.write('\nexpected:\n');

    _.each(error.expected, function (ex) {
      if (ex.parserName) {
        process.stderr.write(ex.parserName + '\n');
      } else {
        process.stderr.write(ex + '\n');
      }
    });
    
    sourceFile.printIndex(this.index);
  };
}

var parseFailure = function(expected, index, context, message) {
  return {isError: true, expected: expected, index: index, context: context, message: message};
};

var createParser = function (name, originalRe, createTerm, dontIgnoreWhitespace) {
  var ignoreCaseFlag = originalRe.ignoreCase? 'i': '';
  
  var re = new RegExp(originalRe.source, 'g' + ignoreCaseFlag);
  var parser = memotable.memoise(function (source, index, context) {
    re.lastIndex = index;
    var match = re.exec(source);
    if (match && match.index == index) {
      var term = createTerm.apply(undefined, match);
      if (term) {
        term.index = re.lastIndex;
        term.context = context;
        return term;
      } else {
        return parseFailure([parser], index, context);
      }
    } else {
      return parseFailure([parser], index, context);
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
    
    args = args.splice(0, args.length);
    
    var subterms = _.map(args, function (subtermArgument) {
      return readSubTerm(subtermArgument);
    });
    
    return memotable.memoise(function (source, startIndex, startContext) {
      var term = {index: startIndex};
      var index = startIndex;
      var context = startContext;
      
      for (var n = 0; n < subterms.length; n++) {
        var subterm = subterms[n];
        
        var parseResult = subterm.parser(source, index, context);
        
        if (!parseResult.isError) {
          subterm.addToTerm(term, parseResult);
          index = parseResult.index;
          context = parseResult.context;
        } else {
          return parseResult;
        }
      }
      
      term.index = index;
      term.context = context;
      
      return term;
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

var identifierRegExp = /[a-z_][a-z0-9_]*/i;

var operator = exports.operator = createParser(
  'identifier',
  /[!@#$%^&*:<>.\\\/?=+-]+/,
  function(op) {
    if (op != '!' && op != '=' && op != '.' && op != ':' && op != '#') {
      return terms.identifier(op);
    }
  }
);

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
    return terms.string(str.replace(/''/g, "'"));
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
    return {indentation: i, dontMemoise: true};
  },
  true
);

var stringStartsWith = function (bigString, toStartWith) {
  return (bigString.length > toStartWith.length) && (bigString.substring(0, toStartWith.length) == toStartWith);
};

var indent = exports.indent = memotable.memoise(function(source, index, context) {
  var result = indentation(source, index, context);
  
  if (result.isError) {
    return result;
  }

  if (stringStartsWith(result.indentation, context.indentation)) {
    result.context = result.context.withIndentation(result.indentation);
    return result;
  } else {
    return parseFailure([indent], index, context);
  }
});

var unindent = exports.unindent = memotable.memoise(function(source, index, context) {
  if (source.length == index) {
    if (!_.isUndefined(context.previousIndentation())) {
      var newContext = context.oldIndentation();
      return {index: index, context: newContext, dontMemoise: true};
    } else {
      return parseFailure([unindent], index, context);
    }
  } else {
    var result = unindentation(source, index, context);
  
    if (result.isError) {
      return result;
    }
    
    if (!context.containsIndentation(result.indentation)) {
      return parseFailure([unindent], index, context);
    } else {
      if (context.previousIndentation() != result.indentation) {
        result.index = index;
        result.dontMemoise = true;
        result.context = result.context.oldIndentation();
        return result;
      } else {
        var shortResult = indentationForNextLineOnly(source, index, context);


        if (shortResult.isError) {
          return result;
        }
        
        shortResult.context = shortResult.context.oldIndentation();
        return shortResult;
      }
    }
  }
});

var noindent = exports.noindent = nameParser('new line', memotable.memoise(function(source, index, context){
  var result = indentation(source, index, context);
  
  if (result.isError) {
    return result;
  }
  
  if (result.indentation == context.indentation) {
    return result;
  } else {
    return parseFailure([noindent], index, context);
  }
}));

var startResetIndent = exports.startResetIndent = memotable.memoise(function(source, index, context){
  var result = indentationOrWhitespaceIncludingNewlines(source, index, context);
  
  if (result.isError) {
    return result;
  }
  
  if (result.indentation) {
    result.context = context.withIndentation(result.indentation);
  } else {
    result.context = context.withIndentation(context.indentation);
  }
  
  return result;
});

var endResetIndent = exports.endResetIndent = memotable.memoise(function(source, index, context){
  var result = whitespaceIncludingNewlines(source, index, context);
  
  if (result.isError) {
    return result;
  }

  result.context = context.oldIndentation(result.indentation);
  return result;
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
  var parseAllChoices = memotable.memoise(function (source, index, context) {
    for (var n = 0; n < parseAllChoices.choices.length; n++) {
      var choiceParser = parseAllChoices.choices[n];

      var result = choiceParser(source, index, context);
      
      if (!result.isError) {
        return result;
      }
    }
    
    return parseFailure(parseAllChoices.choices, index, context);
  });
  
  parseAllChoices.choices = Array.prototype.slice.call(arguments);
  
  return parseAllChoices;
};

var indentationOrWhitespaceIncludingNewlines = choice(indentation, whitespaceIncludingNewlines);

var Context = exports.Context = function () {
  this.previousIndentations = [];
  this.indentation = '';
  
  this.withIndentation = function (indentation) {
    var newContext = new Context();
    if (_.isUndefined(indentation)) {
      throw new Error();
    }
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
    if (_.isUndefined(context.indentation)) {
      throw new Error();
    }
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
  memotable.clear();
  index = (index || 0);
  context = context || new Context();
  
  var wholeFileParser = transform(parser, function(term) {
    if (partial || (term && (term.index == source.length))) {
      return term;
    } else {
      return parseFailure([parser], term.index, term.context, 'did not parse whole file');
    }
  });
  
  return wholeFileParser(source, index, context);
};

var parseModule = exports.parseModule = function (source) {
  return parse(_module, source, 0, undefined, undefined);
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
  
  return memotable.memoise(function (source, startIndex, startContext) {
    var terms = [];
    terms.context = startContext;
    terms.index = startIndex;
    
    var index = startIndex;
    var context = startContext;
    
    var parsedEnough = function() {
      return terms.length >= min;
    };

    while (true) {
      var result = parser(source, index, context);
    
      if (result.isError) {
        if (parsedEnough()) {
          return terms;
        } else {
          return result;
        }
      }
    
      index = result.index;
      terms.index = index;
      
      context = result.context;
      terms.context = context;
      
      terms.push(result);
    
      if (delimiter) {
        var delimiterResult = delimiter(source, result.index, result.context);
        
        if (delimiterResult.isError) {
          if (parsedEnough()) {
            return terms;
          } else {
            return delimiterResult;
          }
        }
  
        index = delimiterResult.index;
        context = delimiterResult.context;
      }
    }
  });
};

var transformWith = function (term, transformer) {
  return termDerivedFrom(term, transformer(term));
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
  return memotable.memoise(function (source, index, context) {
    var result = parser(source, index, context);
    
    if (result.isError) {
      return result;
    }
    
    return transformWith(result, transformer);
  });
};

var argument = sigilIdentifier('@', 'argument', function (argumentName) {
  return terms.variable([argumentName]);
});

var parameter = sigilIdentifier('?', 'parameter', function (argumentName) {
  return terms.parameter([argumentName]);
});

var noArgumentFunctionCallSuffix = transform(keyword('!'), function (result) {
  return terms.noArgSuffix();
});

var terminal = nameParser('terminal', choice(float, integer, argument, identifier, parameter, operator, string, noArgumentFunctionCallSuffix));

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

var methodCall = nameParser('method call', transform(sequence(keyword(':'), ['methodCall', basicExpression], ['assignmentSource', optional(sequence(keyword('='), ['expression', expression]))]), function (term) {
  term.makeExpression = function (expression) {
    if (this.assignmentSource[0]) {
      var source = this.assignmentSource[0].expression;
      
      return this.methodCall.objectDefinitionTarget(expression, source);
    } else {
      return this.methodCall.methodCall(expression);
    }
  };
  return term;
}));

var expressionSuffix = nameParser('expression suffix', choice(methodCall));

var primaryExpression = nameParser('primary expression', choice(functionCall));

var fullExpression = transform(sequence(['expression', primaryExpression], ['suffix', multiple(expressionSuffix, 0)]), function (term) {
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

var definition = nameParser('definition', transform(sequence(['target', basicExpression], keyword('='), ['source', expression]), function (term) {
  return term.target.definitionTarget(term.source);
}));

primaryExpression.choices.unshift(definition);

var statementTerminator = nameParser('statement terminator', choice(noindent, keyword('.')));
var startBlock = nameParser('start block', choice(sequence(keyword('{'), startResetIndent), indent));
var endBlock = nameParser('end block', choice(sequence(endResetIndent, keyword('}')), unindent));

var statements = nameParser('statements', transform(sequence(['statements', delimited(expression, multiple(statementTerminator), 0)]), function (term) {
  return terms.statements(term.statements);
}));

var _module = nameParser('module', transform(sequence(startResetIndent, ['statements', statements], endResetIndent), function (stmts) {
  return terms.module(stmts.statements);
}));

var subExpression = nameParser('sub expression', transform(sequence(keyword('('), ['expression', expression], keyword(')')), function (term) {
  return term.expression;
}));
terminal.choices.push(subExpression);

var block = nameParser('block', transform(sequence(startBlock, ['body', statements], endBlock), function (term) {
  return terms.block([], term.body);
}));

terminal.choices.push(block);

var list = nameParser('list', transform(sequence(sequence(keyword('['), startResetIndent), ['items', delimited(expression, statementTerminator, 0)], sequence(endResetIndent, keyword(']'))), function(term) {
  return terms.list.call(terms.list, term.items);
}));

terminal.choices.push(list);

var hash = nameParser('hash', transform(sequence(sequence(keyword('#'), startBlock), ['entries', delimited(basicExpression, choice(keyword(','), statementTerminator), 0)], endBlock), function(term) {
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
