var _ = require('underscore');

var parseError = exports.parseError = function (term, message, expected) {
  expected = expected || [];
  
  var e = new Error(message);
  e.index = term.index;
  e.context = term.context;
  e.expected = expected;
  
  return e;
};

var semanticFailure = function(term, message) {
  return new function() {
    this.isSemanticFailure = true;
    this.term = term;
    this.message = message;
  };
};

var ExpressionPrototype = new function () {
  this.generateJavaScriptReturn = function (buffer, scope) {
    buffer.write('return ');
    this.generateJavaScript(buffer, scope);
    buffer.write(';');
  };
  this.generateJavaScriptStatement = function (buffer, scope) {
    this.generateJavaScript(buffer, scope);
    buffer.write(';');
  };
  this.definitions = function (scope) {
    return [];
  };
  this.definitionName = function(scope) {
  }
};

var addWalker = function () {
  var self = arguments[0];
  var subtermNames = Array.prototype.splice.call(arguments, 1, arguments.length - 1);
  
  self.walk = function (visitor) {
    visitor(this);
    
    for (var n in subtermNames) {
      var subterm = this[subtermNames[n]];
      
      if (_.isArray(subterm)) {
        for (var i in subterm) {
          subterm[i].walk(visitor);
        }
      } else {
        subterm.walk(visitor);
      }
    }
  };
};

var expressionTerm = function (name, constructor) {
  constructor.prototype = ExpressionPrototype;
  return exports[name] = function () {
    var args = arguments;
    var F = function () {
      return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
  };
};

exports.identifier = function (name) {
  return {
    identifier: name
  };
};

var integer = expressionTerm('integer', function (value) {
  this.integer = value;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write(this.integer.toString());
  };
});

var boolean = expressionTerm('boolean', function(value) {
  this.boolean = value;
});

var formatJavaScriptString = function(s) {
  return "'" + s.replace("'", "\\'") + "'";
};

expressionTerm('string', function(value) {
  this.isString = true;
  this.string = value;
  this.generateJavaScript = function(buffer, scope) {
    buffer.write(formatJavaScriptString(this.string));
  };
});

expressionTerm('float', function (value) {
  this.float = value;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write(this.float.toString());
  };
});

var variable = expressionTerm('variable', function (name) {
  this.variable = name;
  this.isVariable = true;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write(concatName(this.variable));
  };
  this.generateJavaScriptTarget = this.generateJavaScript;
  this.definitionName = function(scope) {
    return this.variable;
  };
  
  addWalker(this);
});

var parameter = expressionTerm('parameter', function (name) {
  this.parameter = name;
  this.isParameter = true;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write(concatName(this.parameter));
  };
});

var concatName = function (nameSegments) {
  var name = nameSegments[0];
  
  for (var n = 1; n < nameSegments.length; n++) {
    var segment = nameSegments[n];
    name += segment[0].toUpperCase() + segment.substring(1);
  }
  
  return name;
};

var functionCall = expressionTerm('functionCall', function (fun, arguments) {
  this.function = fun;
  this.arguments = arguments;
  this.isFunctionCall = true;
  this.generateJavaScript = function (buffer, scope) {
    fun.generateJavaScript(buffer, scope);
    buffer.write('(');
    var first = true;
    _(this.arguments).each(function (arg) {
      if (!first) {
        buffer.write(',');
      }
      first = false;
      arg.generateJavaScript(buffer, scope);
    });
    
    buffer.write(')');
  };
});

var block = expressionTerm('block', function (parameters, body) {
  this.body = body;
  this.isBlock = true;
  this.parameters = parameters;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write('function(');
    var first = true;
    _(this.parameters).each(function (parameter) {
      if (!first) {
        buffer.write(',');
      }
      first = false;
      parameter.generateJavaScript(buffer, scope);
    });
    buffer.write('){');
    body.generateJavaScriptReturn(buffer, scope.subScope());
    buffer.write('}');
  };
});

var writeToBufferWithDelimiter = function (array, delimiter, buffer, scope, writer) {
  writer = writer || function (item, buffer) {
    item.generateJavaScript(buffer, scope);
  };
  
  var first = true;
  _(array).each(function (item) {
    if (!first) {
      buffer.write(delimiter);
    }
    first = false;
    writer(item, buffer);
  });
};

expressionTerm('methodCall', function (object, name, arguments) {
  this.object = object;
  this.name = name;
  this.arguments = arguments;
  this.generateJavaScript = function (buffer, scope) {
    this.object.generateJavaScript(buffer, scope);
    buffer.write('.');
    buffer.write(concatName(this.name));
    buffer.write('(');
    writeToBufferWithDelimiter(this.arguments, ',', buffer, scope);
    buffer.write(')');
  };
  
  addWalker(this, 'object', 'arguments');
});

var indexer = expressionTerm('indexer', function (object, indexer) {
  this.object = object;
  this.indexer = indexer;
  this.isIndexer = true;
  this.generateJavaScript = function (buffer, scope) {
    this.object.generateJavaScript(buffer, scope);
    buffer.write('[');
    this.indexer.generateJavaScript(buffer, scope);
    buffer.write(']');
  };
  this.generateJavaScriptTarget = this.generateJavaScript;
});

var fieldReference = expressionTerm('fieldReference', function (object, name) {
  this.object = object;
  this.name = name;
  this.isFieldReference = true;
  this.generateJavaScript = function (buffer, scope) {
    this.object.generateJavaScript(buffer, scope);
    buffer.write('.');
    buffer.write(concatName(this.name));
  };
  this.generateJavaScriptTarget = this.generateJavaScript;
});

var hasScope = function (s) {
  if (!s) {
    console.log('---------------- NO SCOPE! -----------------');
    throw new Error('no scope');
  }
};

var Statements = function (statements) {
  this.statements = statements;
  
  this.generateStatements = function (statements, buffer, scope) {
    hasScope(scope);
    
    var namesDefined = _(this.statements).chain().reduce(function (list, statement) {
      var defs = statement.definitions(scope);
      return list.concat(defs);
    }, []).map(function (name) {
      return concatName(name);
    }).filter(function (name) {
      if (!scope.isDefined(name)) {
        scope.define(name);
        return true;
      } else {
        return false;
      }
    }).value();
    
    if (namesDefined.length > 0) {
      buffer.write ('var ');
      writeToBufferWithDelimiter(namesDefined, ',', buffer, scope, function (item, b) {
        b.write(item);
      });
      buffer.write(';');
    }
    
    _(statements).each(function (statement) {
      statement.generateJavaScriptStatement(buffer, scope);
    });
  };
  
  this.generateJavaScript = function (buffer, scope) {
    this.generateStatements(this.statements, buffer, scope);
  };
  
  this.generateJavaScriptReturn = function (buffer, scope) {
    if (this.statements.length > 0) {
      this.generateStatements(this.statements.slice(0, this.statements.length - 1), buffer, scope);
      this.statements[this.statements.length - 1].generateJavaScriptReturn(buffer, scope);
    }
  };
  
  this.definitions = function(scope) {
    return _(statements).reduce(function (list, statement) {
      var defs = statement.definitions(scope);
      return list.concat(defs);
    }, []);
  };
  
  this.generateJavaScriptStatement = this.generateJavaScript;
};

expressionTerm('module', function (statements) {
  this.statements = statements;
  
  this.generateJavaScript = function (buffer, scope) {
    functionCall(subExpression(block([], this.statements))).generateJavaScript(buffer, new Scope());
  };
});

var UniqueNames = function() {
  var unique = 1;
  
  this.generateName = function(name) {
    return 'gen' + unique++ + '_' + name;
  };
};

var Scope = exports.Scope = function (parentScope, uniqueNames) {
  var uniqueNames = uniqueNames || new UniqueNames();
  
  var variables = {};
  
  this.define = function (name) {
    variables[name] = true;
  };
  
  this.generateVariable = function(name) {
    return uniqueNames.generateName(name);
  };
  
  this.isDefined = function (name) {
    return variables[name] || (parentScope && parentScope.isDefined(name));
  };
  
  this.subScope = function () {
    return new Scope(this, uniqueNames);
  };
};

var statements = exports.statements = function (s) {
  return new Statements(s);
};

var extractName = function (terminals) {
  return _(terminals).filter(function (terminal) {
    return terminal.identifier;
  }).map(function (identifier) {
    return identifier.identifier;
  });
};

var definition = expressionTerm('definition', function (target, source) {
  this.target = target;
  this.source = source;
  this.isDefinition = true;
  
  this.generateJavaScript = function (buffer, scope) {
    target.generateJavaScriptTarget(buffer, scope);
    buffer.write('=');
    source.generateJavaScript(buffer, scope);
  };
  this.definitions = function (scope) {
    var def = target.definitionName(scope);
    if (def) {
      return [def];
    } else {
      return [];
    }
  };
  
  addWalker(this, 'target', 'source');
});

expressionTerm('basicExpression', function(terminals) {
  var isVariableExpression;
  
  this.terminals = terminals;
  
  this.isVariableExpression = function () {
    return _.isUndefined(isVariableExpression)?
      (isVariableExpression = _(this.terminals).all(function (terminal) {
        return terminal.identifier;
      })): isVariableExpression;
  };
  
  this.variable = function () {
    return variable(this.name());
  };
  
  this.name = function() {
    return extractName(this.terminals);
  };
  
  this.parameters = function() {
    return _(this.terminals).filter(function (terminal) {
      return terminal.isParameter;
    });
  };
  
  this.expression = function () {
    this.buildBlocks();
    var terminals = this.terminals;

    var name = this.name();

    if (name.length == 0 && terminals.length > 1) {
      return functionCall(terminals[0], terminals.splice(1));
    }

    var createMacro = macros.findMacro(name);
    if (createMacro) {
      return createMacro(this);
    }

    if (this.isVariableExpression()) {
      return this.variable();
    }

    if (this.isTerminalExpression()) {
      return this.terminal();
    }

    var isNoArgCall = this.isNoArgumentFunctionCall();

    var arguments = this.arguments();

    if (isNoArgCall && arguments.length > 0) {
      return semanticFailure(this, 'this function has arguments and an exclaimation mark (implying no arguments)');
    }

    return functionCall(variable(name), arguments);
  };
  
  this.hashEntry = function() {
    this.buildBlocks();
    
    var args = this.arguments();
    var name = this.name();

    if (name.length > 0 && args.length == 1) {
      return hashEntry(name, args[0]);
    }
    
    if (name.length > 0 && args.length == 0) {
      return hashEntry(name, boolean(true));
    }
    
    if (name.length == 0 && args.length == 2 && args[0].isString) {
      return hashEntry([args[0].string], args[1]);
    }
  };
  
  this.makeSourceWithParameters = function(source) {
    var params = this.parameters();
  
    if (params.length > 0) {
      if (!source.isBlock) {
        return block(params, source);
      } else {
        source.parameters = params;
        return source;
      }
    } else {
      return source;
    }
  };
  
  this.definitionTarget = function (source) {
    return definition(variable(this.name()), this.makeSourceWithParameters(source));
  };
  
  this.hasNameAndNoArguments = function() {
    return (this.name().length > 0) && (this.arguments().length == 0);
  };
  
  this.objectDefinitionTarget = function(expression, source) {
    if (this.hasNameAndNoArguments()) {
      return definition(fieldReference(expression, this.name()), this.makeSourceWithParameters(source));
    } else if (this.isTerminalExpression()) {
      return definition(indexer(expression, this.terminal()), source);
    } else {
      throw parseError(this, "didn't expect expression here");
    }
  };
  
  this.isTerminalExpression = function () {
    return this.terminals.length == 1;
  };
  
  this.terminal = function () {
    return this.terminals[0];
  };
  
  this.isNoArgumentFunctionCall = function() {
    return this.terminals[this.terminals.length - 1].noArgumentFunctionCallSuffix;
  };
  
  this.arguments = function() {
    return _(this.terminals).filter(function (terminal) {
      return !terminal.identifier && !terminal.noArgumentFunctionCallSuffix && !terminal.isParameter;
    });
  };
  
  this.buildBlocks = function () {
    var parameters = [];
    
    _(this.terminals).each(function (terminal) {
      if (terminal.isParameter) {
        parameters.push(terminal);
      } else if (terminal.body) {
        terminal.parameters = parameters;
        parameters = [];
      }
    });
    
    this.terminals = _(this.terminals).filter(function(terminal) {
      return !terminal.isParameter;
    });
  };
});

var MacroDirectory = exports.MacroDirectory = function () {
  var nameTreeRoot = {};
  
  this.addMacro = function(name, createMacro) {
    var nameTree = nameTreeRoot;
    _(name).each(function(nameSegment) {
      if (!nameTree[nameSegment]) {
        nameTree = nameTree[nameSegment] = {};
      } else {
        nameTree = nameTree[nameSegment];
      }
    });
    nameTree['create macro'] = createMacro;
  };
  
  this.findMacro = function(name) {
    var nameTree = nameTreeRoot;
    _(name).each(function(nameSegment) {
      if (nameTree) {
        nameTree = nameTree[nameSegment];
      }
    });
    
    if (nameTree) {
      return nameTree['create macro'];
    }
  };
};

var macros = exports.macros = new MacroDirectory();

var list = expressionTerm('list', function(items) {
  this.list = items;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write('[');
    writeToBufferWithDelimiter(this.list, ',', buffer, scope);
    buffer.write(']');
  };
});

var hash = expressionTerm('hash', function(entries) {
  this.isHash = true;
  this.entries = entries;
  
  this.generateJavaScript = function(buffer, scope) {
    buffer.write('{');
    writeToBufferWithDelimiter(this.entries, ',', buffer, scope, function (item, b) {
      item.generateJavaScriptHashEntry(b, scope);
    });
    buffer.write('}');
  };
});

var isLegalJavaScriptIdentifier = function(id) {
  return /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(id);
};

var hashEntry = expressionTerm('hashEntry', function(field, value) {
  this.field = field;
  this.value = value;
  this.generateJavaScriptHashEntry = function(buffer, scope) {
    var f = concatName(this.field);
    if (isLegalJavaScriptIdentifier(f)) {
      buffer.write(f);
    } else {
      buffer.write(formatJavaScriptString(f));
    }
    buffer.write(':');
    this.value.generateJavaScript(buffer, scope);
  };
});

var ifExpression = expressionTerm('ifExpression', function (condition, then, _else) {
  this.isIfExpression = true;
  
  this.condition = condition;
  this.then = then;
  this._else = _else;
  
  this.generateJavaScriptStatement = function (buffer, scope) {
    buffer.write('if(');
    this.condition.generateJavaScript(buffer, scope);
    buffer.write('){');
    this.then.generateJavaScript(buffer, scope);
    buffer.write('}');
    if (this._else) {
      buffer.write('else{');
      this._else.generateJavaScript(buffer, scope);
      buffer.write('}');
    }
  };
  
  this.generateJavaScript = function (buffer, scope) {
    functionCall(subExpression(block([], statements([this]))), []).generateJavaScript(buffer, scope);
  };
  
  this.generateJavaScriptReturn = function (buffer, scope) {
    buffer.write('if(');
    this.condition.generateJavaScript(buffer, scope);
    buffer.write('){');
    this.then.generateJavaScriptReturn(buffer, scope);
    buffer.write('}');
    if (this._else) {
      buffer.write('else{');
      this._else.generateJavaScriptReturn(buffer, scope);
      buffer.write('}');
    }
  };
});

var createIfExpression = function(expression) {
  var args = expression.arguments();
  
  var _else = args[2];
  var then = args[1];
  
  return ifExpression(args[0], then.body, _else? _else.body: undefined);
};

macros.addMacro(['if'], createIfExpression);
macros.addMacro(['if', 'else'], createIfExpression);

var newOperator = expressionTerm('newOperator', function(functionCall) {
  this.isNewOperator = true;
  this.functionCall = functionCall;
  this.generateJavaScript = function(buffer, scope) {
    buffer.write('new ');
    this.functionCall.generateJavaScript(buffer, scope);
  }
});

macros.addMacro(['new'], function(basicExpression) {
  var args = basicExpression.arguments();
  return newOperator(args[0]);
});

var generatedVariable = expressionTerm('generatedVariable', function(name) {
  this.name = name;
  var genVar;
  
  this.generatedName = function(scope) {
    if (!genVar) {
      genVar = scope.generateVariable(concatName(this.name));
    }
    return genVar;
  };
  
  this.generateJavaScript = function(buffer, scope) {
    buffer.write(this.generatedName(scope));
  };
  this.generateJavaScriptTarget = this.generateJavaScript;
  this.definitionName = function(scope) {
    var n = this.generatedName(scope);
    return [this.generatedName(scope)];
  };
});

var postIncrement = expressionTerm('postIncrement', function(expr) {
  this.expression = expr;
  this.generateJavaScript = function(buffer, scope) {
    this.expression.generateJavaScript(buffer, scope);
    buffer.write('++');
  };
});

var forEach = expressionTerm('forEach', function(collection, itemVariable, stmts) {
  var itemsVar = generatedVariable(['items']);
  var indexVar = generatedVariable(['i']);
  var s = [definition(variable(itemVariable), indexer(itemsVar, indexVar))];
  s.push.apply(s, stmts.statements);
  var statementsWithItemAssignment = statements(s);
  
  var init = definition(indexVar, integer(0));
  var test = operator('<', [indexVar, fieldReference(itemsVar, ['length'])]);
  var incr = postIncrement(indexVar);
  
  return statements([
    definition(itemsVar, collection),
    forStatement(init, test, incr, statementsWithItemAssignment)
  ]);
});

macros.addMacro(['for', 'each', 'in', 'do'], function(basicExpression) {
  var args = basicExpression.arguments();
  var collection = args[0];
  var block = args[1];
  
  var itemVariable = block.parameters[0].parameter;
  
  return forEach(collection, itemVariable, block.body);
});

var forStatement = expressionTerm('forStatement', function(init, test, incr, stmts) {
  this.isFor = true;
  this.initialization = init;
  this.test = test;
  this.increment = incr;
  this.statements = stmts;
  
  this.indexVariable = init.target;
  
  this.generateJavaScript = function(buffer, scope) {
    buffer.write('for(');
    this.initialization.generateJavaScript(buffer, scope);
    buffer.write(';');
    this.test.generateJavaScript(buffer, scope);
    buffer.write(';');
    this.increment.generateJavaScript(buffer, scope);
    buffer.write('){');
    this.statements.generateJavaScript(buffer, scope);
    buffer.write('}');
  };
  this.generateJavaScriptStatement = this.generateJavaScript;
  this.generateJavaScriptReturn = this.generateJavaScript;
  
  this.definitions = function(scope) {
    var defs = [];
    var indexName = this.indexVariable.definitionName(scope);
    if (indexName) {
      defs.push(indexName);
    }
    defs.push.apply(defs, stmts.definitions(scope));
    return defs;
  };
});

macros.addMacro(['for'], function(basicExpression) {
  var args = basicExpression.arguments();
  var init = args[0].body.statements[0];
  var test = args[1].body.statements[0];
  var incr = args[2].body.statements[0];
  
  return forStatement(init, test, incr);
});

var subExpression = expressionTerm('subExpression', function (expr) {
  this.expression = expr;
  
  this.generateJavaScript = function(buffer, scope) {
    buffer.write('(');
    this.expression.generateJavaScript(buffer, scope);
    buffer.write(')');
  };
});

var operator = expressionTerm('operator', function (op, args) {
  this.operator = op;
  this.arguments = args;
  this.generateJavaScript = function(buffer, scope) {
    buffer.write('(');
    this.arguments[0].generateJavaScript(buffer, scope);
    buffer.write(op);
    this.arguments[1].generateJavaScript(buffer, scope);
    buffer.write(')');
  };
});

var createOperator = function(expr) {
  return operator(expr.name()[0], expr.arguments());
};

_.each(['+', '*', '/', '-', '>=', '==', '===', '<=', '<', '>'], function(op) {
  macros.addMacro([op], createOperator);
});

macros.addMacro(['and'], function (expr) {
  return operator('&&', expr.arguments());
});

macros.addMacro(['or'], function (expr) {
  return operator('||', expr.arguments());
});

var returnStatement = expressionTerm('returnStatement', function(expr) {
  this.isReturn = true;
  this.expression = expr;
  this.generateJavaScriptStatement = function(buffer, scope) {
    this.expression.generateJavaScriptReturn(buffer, scope);
  };
  this.generateJavaScriptReturn = this.generateJavaScriptStatement;
});

macros.addMacro(['return'], function(expr) {
  return returnStatement(expr.arguments()[0]);
});