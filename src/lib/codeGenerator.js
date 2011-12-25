var _ = require('underscore');
var util = require('util');

var parseError = exports.parseError = function (term, message, expected) {
  expected = expected || [];
  
  var e = new Error(message);
  e.index = term.index;
  e.context = term.context;
  e.expected = expected;
  
  return e;
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
  };
  this.inspectTerm = function () {
    return util.inspect(this, false, 10);
  };
  this.show = function (desc) {
    if (desc) {
      console.log(desc, this.inspectTerm());
    } else {
      console.log(this.inspectTerm());
    }
  };
  this.blockify = function (parameters, optionalParameters) {
    var b = block(parameters, statements([this]));
    b.optionalParameters = optionalParameters;
    return b;
  };
  this.scopify = function () {
    return this;
  };

  this.subterms = function () {
    this._subtermNames = Array.prototype.slice.call(arguments, 0);
  };
  
  this.mergeLocations = function (locations) {
    if (locations.length <= 0) {
      throw new Error('no locations for term: ' + this.inspectTerm() + '\n');
    }
    
    firstLines = _.map(locations, function (l) {
      return l.firstLine;
    });
    
    lastLines = _.map(locations, function (l) {
      return l.lastLine;
    });
    
    firstColumns = _.map(locations, function (l) {
      return l.firstColumn;
    });
    
    lastColumns = _.map(locations, function (l) {
      return l.lastColumn;
    });
    
    return {
      firstLine: _.min(firstLines),
      lastLine: _.max(lastLines),
      firstColumn: _.min(firstColumns),
      lastColumn: _.max(lastColumns)
    };
  };
  
  this.allSubterms = function () {
    var term = this;
    return _.flatten(_.map(this._subtermNames, function (name) {
      return term[name];
    }));
  };
  
  this.location = function () {
    var term = this;
    
    return this._location || (this._location = (
      term.mergeLocations(_.map(term.allSubterms(), function (subterm) {
        return subterm.location();
      }))
    ));
  };
};

var term = exports.term = function (members) {
  members.prototype = ExpressionPrototype;
  return new members();
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

var semanticFailure = require('./semanticFailure');

exports.identifier = function (name) {
  return {
    identifier: name
  };
};

var integer = expressionTerm('integer', function (value, location) {
  this.isInteger = true;
  this.integer = value;
  this.location = location;
  
  this.generateJavaScript = function (buffer, scope) {
    buffer.write(this.integer.toString());
  };
});

var boolean = expressionTerm('boolean', function(value) {
  this.boolean = value;
  this.generateJavaScript = function (buffer, scope) {
    if (this.boolean) {
      buffer.write('true');
    } else {
      buffer.write('false');
    }
  };
});

var formatJavaScriptString = function(s) {
  return "'" + s.replace(/'/g, "\\'") + "'";
};

expressionTerm('interpolatedString', function (value) {
  this.isInterpolatedString = true;
  this.components = value;

  this.componentsDelimitedByStrings = function () {
    var comps = [];
    var lastComponentWasExpression = false;

    _.each(this.components, function (component) {
      if (lastComponentWasExpression && !component.isString) {
        comps.push(string(''));
      }

      comps.push(component);

      lastComponentWasExpression = !component.isString;
    });

    return comps;
  };

  this.generateJavaScript = function (buffer, scope) {
    writeToBufferWithDelimiter(this.componentsDelimitedByStrings(), '+', buffer, scope);
  };
});

var normaliseString = exports.normaliseString = function(s) {
  return s.substring(1, s.length - 1).replace(/''/g, "'");
};

var string = expressionTerm('string', function(value) {
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
  
  this.parameter = function () {
    return parameter(this.variable);
  };
  
  addWalker(this);
});

var selfExpression = exports.selfExpression = function () {
  return variable(['self']);
};

var noArgSuffix = expressionTerm('noArgSuffix', function () {
    this.noArgumentFunctionCallSuffix = true;
});

var parameter = expressionTerm('parameter', function (name) {
  this.parameter = name;
  this.isParameter = true;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write(concatName(this.parameter));
  };
});

var concatName = exports.concatName = function (nameSegments) {
  var name = nameSegments[0];
  
  for (var n = 1; n < nameSegments.length; n++) {
    var segment = nameSegments[n];
    name += segment[0].toUpperCase() + segment.substring(1);
  }
  
  return name;
};

var functionCall = expressionTerm('functionCall', function (fun, args, optionalArgs) {
  this.isFunctionCall = true;

  this.function = fun;
  this.arguments = args;
  this.optionalArguments = optionalArgs;

  this.generateJavaScript = function (buffer, scope) {
    fun.generateJavaScript(buffer, scope);
    buffer.write('(');
    writeToBufferWithDelimiter(argsAndOptionalArgs(this.arguments, this.optionalArguments), ',', buffer, scope);
    buffer.write(')');
  };
});

var optional = expressionTerm('optional', function (options, name, defaultValue) {
  this.options = options;
  this.name = name;
  this.defaultValue = defaultValue;

  this.generateJavaScript = function (buffer, scope) {
    buffer.write('(');
    this.options.generateJavaScript(buffer, scope);
    buffer.write('&&');
    this.options.generateJavaScript(buffer, scope);
    buffer.write('.' + concatName(this.name) + "!=null)?");
    this.options.generateJavaScript(buffer, scope);
    buffer.write('.' + concatName(this.name) + ':');
    defaultValue.generateJavaScript(buffer, scope);
  };
});

var block = expressionTerm('block', function (parameters, body, options) {
  this.body = body;
  this.isBlock = true;
  this.returnLastStatement = options && options.returnLastStatement != null? options.returnLastStatement: true;
  this.parameters = parameters;
  this.optionalParameters = null;
  this.redefinesSelf = options && options.redefinesSelf != null? options.redefinesSelf: false;
  
  this.hasOptionalParmeters = function () {
    return this.optionalParameters && this.optionalParameters.length > 0;
  };
  
  this.statementsForOptionalParameters = function () {
    if (this.hasOptionalParmeters()) {
      var options = this.optionParameter;

      return _.map(this.optionalParameters, function (parm) {
        return definition(variable(parm.field), optional(options, parm.field, parm.value));
      });
    } else {
      return [];
    }
  };
  
  this.statementForSelf = function () {
    if (this.redefinesSelf) {
      return [definition(selfExpression(), variable(['this']))];
    } else {
      return [];
    }
  };
  
  this.allStatements = function () {
    return this.statementForSelf().concat(
      this.statementsForOptionalParameters().concat(
        this.body.statements
      )
    );
  };
  
  this.completeBody = function () {
    return statements(this.allStatements());
  };

  this.allParameters = function () {
    var parms = this.parameters.slice();
    
    if (this.hasOptionalParmeters()) {
      this.optionParameter = generatedVariable(['options']);
      parms.push(this.optionParameter);
    }

    return parms;
  };
  
  this.blockify = function (parameters, optionalParameters) {
    this.parameters = parameters;
    this.optionalParameters = optionalParameters;
    return this;
  };
  
  this.scopify = function () {
    return functionCall(this, []);
  };

  this.generateJavaScript = function (buffer, scope) {
    buffer.write('function(');
    writeToBufferWithDelimiter(this.allParameters(), ',', buffer, scope);
    buffer.write('){');
    var body = this.completeBody();
    if (this.returnLastStatement) {
      body.generateJavaScriptReturn(buffer, scope.subScope());
    } else {
      body.generateJavaScript(buffer, scope.subScope());
    }
    buffer.write('}');
  };
});

var writeToBufferWithDelimiter = function (array, delimiter, buffer, scope) {
  var writer;
  if (typeof scope == 'function') {
    writer = scope;
  } else {
    writer = function (item) {
      item.generateJavaScript(buffer, scope);
    };
  }
  
  var first = true;
  _(array).each(function (item) {
    if (!first) {
      buffer.write(delimiter);
    }
    first = false;
    writer(item);
  });
};

var argsAndOptionalArgs = function (args, optionalArgs) {
  var a = args.slice();

  if (optionalArgs && optionalArgs.length > 0) {
    a.push(hash(optionalArgs));
  }

  return a;
};

var methodCall = expressionTerm('methodCall', function (object, name, arguments, optionalArguments) {
  this.isMethodCall = true;
  this.object = object;
  this.name = name;
  this.arguments = arguments;
  this.optionalArguments = optionalArguments;

  this.generateJavaScript = function (buffer, scope) {
    this.object.generateJavaScript(buffer, scope);
    buffer.write('.');
    buffer.write(concatName(this.name));
    buffer.write('(');
    writeToBufferWithDelimiter(argsAndOptionalArgs(this.arguments, this.optionalArguments), ',', buffer, scope);
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
      writeToBufferWithDelimiter(namesDefined, ',', buffer, function (item) {
        buffer.write(item);
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
  
  this.blockify = function (parameters, optionalParameters) {
    var b = block(parameters, this);
    b.optionalParameters = optionalParameters;
    return b;
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

var module = expressionTerm('module', function (statements) {
  this.statements = statements;
  this.isModule = true;
  
  this.generateJavaScript = function (buffer, scope) {
    var b = block([], this.statements, {returnLastStatement: false, redefinesSelf: true});
    functionCall(subExpression(b), []).generateJavaScript(buffer, new Scope());
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

  this.expression = function () {
    return this;
  };

  this.generateJavaScript = function (buffer, scope) {
    target.generateJavaScriptTarget(buffer, scope);
    buffer.write('=');
    source.generateJavaScript(buffer, scope);
  };
  
  this.definitions = function (scope) {
    var defs = [];
    var t = target.definitionName(scope);
    if (t) {
      defs.push(t);
    }
    var s = this.source.definitions(scope);
    defs = defs.concat(s);
    return defs;
  };
  
  addWalker(this, 'target', 'source');
});
  
var makeSourceWithParameters = function(source, params, optionalParams) {
  if (params.length > 0 || (optionalParams && optionalParams.length > 0)) {
    if (!source.isBlock) {
      var b = block(params, statements([source]));
      b.optionalParameters = optionalParams;
      return b;
    } else {
      source.parameters = params;
      source.optionalParameters = optionalParams;
      return source;
    }
  } else {
    return source;
  }
};

expressionTerm('basicExpression', function(terminals) {
  this.terminals = terminals;
  
  this.isVariableExpression = function () {
    return _(this.terminals).all(function (terminal) {
      return terminal.identifier;
    });
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
  
  this.methodCall = function(objectExpression) {
    this.buildBlocks();
    
    var name = this.name();
    var hasName = name.length > 0;
    var args = this.arguments();
    var hasArgs = args.length > 0 || this.isNoArgumentFunctionCall();
    
    if (hasName && !hasArgs) {
      return fieldReference(objectExpression, name);
    }
    
    if (hasName && hasArgs) {
      return methodCall(objectExpression, name, args);
    }
    
    if (!hasName && hasArgs) {
      if (args.length == 1) {
        return indexer(objectExpression, args[0]);
      } else {
        return semanticFailure(args.slice(1), 'index only requires one argument, these are not required')
      }
    }
    
    return semanticFailure([this], "basic expression with no name and no arguments, how'd that happen?");
  };
  
  this.expression = function (optionalArguments) {
    this.buildBlocks();
    var terminals = this.terminals;

    var name = this.name();
    var hasOptionalArguments = optionalArguments && optionalArguments.length > 0;

    if (name.length == 0 && terminals.length > 1) {
      return functionCall(terminals[0], terminals.splice(1));
    }

    var createMacro = macros.findMacro(name);
    if (createMacro) {
      return createMacro(this);
    }

    if (this.isVariableExpression() && !hasOptionalArguments) {
      return this.variable();
    }

    if (this.isTerminalExpression()) {
      return this.terminal();
    }

    var isNoArgCall = this.isNoArgumentFunctionCall();

    var arguments = this.arguments();

    if (isNoArgCall && (arguments.length > 0 || hasOptionalArguments)) {
      return semanticFailure([this], "this function has arguments and an exclaimation mark (implying no arguments)");
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

  this.target = function () {
    var name = this.name();
    var arguments = this.arguments();
    
    if (arguments.length > 0) {
      return semanticFailure(arguments, 'these arguments cannot be used in definitions');
    }
    
    if (name.length > 0) {
      return definitionTarget(variable(this.name()), this.parameters());
    } else {
      return semanticFailure(this.terminals, 'no name for definition');
    }
  };
  
  this.definitionTarget = function (source) {
    var name = this.name();
    var arguments = this.arguments();
    
    if (arguments.length > 0) {
      return semanticFailure(arguments, 'these arguments cannot be used in definitions');
    }
    
    if (name.length > 0) {
      return definition(variable(this.name()), makeSourceWithParameters(source, this.parameters()));
    } else {
      return semanticFailure(this.terminals, 'no name for definition');
    }
  };
  
  this.hasNameAndNoArguments = function() {
    return (this.name().length > 0) && (this.arguments().length == 0);
  };
  
  this.objectDefinitionTarget = function(expression, source) {
    if (this.hasNameAndNoArguments()) {
      return definition(fieldReference(expression, this.name()), makeSourceWithParameters(source, this.parameters()));
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
  
  this.hasArguments = function () {
    return this.arguments().length > 0;
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

expressionTerm('definitionTarget', function (target, parameters, optionalParameters) {
  this.target = target;
  this.parameters = parameters;
  this.optionalParameters = optionalParameters;
  this.isTarget = target;

  this.definition = function (source) {
    return definition(this.target, makeSourceWithParameters(source.expression(), this.parameters, this.optionalParameters));
  };
});

expressionTerm('objectOperationExpression', function (object, operation) {
  this.isObjectOperationExpression = true;
  this.object = object;
  this.operation = operation;

  this.operation.show('operation');
  this.show('objectOperationExpression');

  this.expression = function () {
    return this.operation.objectOperation(this.object.expression());
  };

  this.target = function () {
    return definitionTarget(this.operation.objectOperationTarget(this.object), this.operation.parameters());
  };
});

expressionTerm('definitionExpression', function (target, source) {
  this.isDefinitionExpression = true;
  this.target = target;
  this.source = source;

  this.expression = function () {
    return this.target.target().definition(this.source);
  };
});

var complexExpression = expressionTerm('complexExpression', function (basicExpressionList) {
  this.isComplexExpression = true;
  this.basicExpressions = basicExpressionList;

  this.headExpression = function () {
    return this.basicExpressions[0];
  };

  this.tailExpressions = function () {
    return this.basicExpressions.slice(1);
  };

  this.hasTail = function () {
    return this.tailExpressions().length > 0;
  }

  this.hashEntries = function () {
    return _.map(this.tailExpressions(), function (optArg) {
      return optArg.hashEntry();
    });
  };

  this.expression = function () {
    var funcCall = this.headExpression().expression(this.hashEntries());
    if (funcCall.isFunctionCall) {
      funcCall.optionalArguments = this.hashEntries();
    }
    return funcCall;
  };

  this.target = function () {
    var t = this.headExpression().target();
    t.optionalParameters = this.hashEntries();
    return t;
  };

  this.methodCall = function (objectExpression) {
    var objectOperation = this.headExpression().methodCall(objectExpression);

    if (objectOperation.isMethodCall) {
      objectOperation.optionalArguments = this.hashEntries();
    } else if (this.hasTail()) {
      return semanticFailure(this.tailExpressions(), 'only method calls can have optional arguments')
    }

    return objectOperation;
  };
  this.objectOperation = this.methodCall;

  this.definitionTarget = function (expression) {
    var def = this.headExpression().definitionTarget(expression);
    
    if (this.hasTail()) {
      if (def.source.isBlock) {
        def.source.optionalParameters = this.hashEntries();
      } else {
        def.source = block([], statements([def.source]));
        def.source.optionalParameters = this.hashEntries();
      }
    }

    return def;
  };

  this.objectDefinitionTarget = function (objectExpression, expression) {
    return this.headExpression().objectDefinitionTarget(objectExpression, expression);
  };

  this.objectOperationTarget = this.objectDefinitionTarget;
});

var MacroDirectory = exports.MacroDirectory = function () {
  var nameTreeRoot = {};
  
  this.nameNode = function (name) {
    var nameTree = nameTreeRoot;
    _(name).each(function(nameSegment) {
      if (!nameTree[nameSegment]) {
        nameTree = nameTree[nameSegment] = {};
      } else {
        nameTree = nameTree[nameSegment];
      }
    });
    return nameTree;
  };
  
  this.addMacro = function(name, createMacro) {
    var nameTree = this.nameNode(name);
    nameTree['create macro'] = createMacro;
  };
  
  this.addWildCardMacro = function (name, matchMacro) {
    var nameTree = this.nameNode(name);
    
    var matchMacros = nameTree['match macro'];
    if (!matchMacros) {
      matchMacros = nameTree['match macro'] = [];
    }
    
    matchMacros.push(matchMacro);
  };
  
  this.findMacro = function(name) {
    var findMatchingWildMacro = function (wildMacros, name) {
      for (var n = 0; n < wildMacros.length; n++) {
        var macro = wildMacros[n](name);
        if (macro) {
          return macro;
        }
      }
    };
    
    var findMacroInTree = function (nameTree, name, index, wildMacros) {
      if (index < name.length) {
        var subtree = nameTree[name[index]];
        
        if (subtree) {
          var matchMacros = subtree['match macro'];
          if (matchMacros) {
            wildMacros = matchMacros.concat(wildMacros);
          }
          return findMacroInTree(subtree, name, index + 1, wildMacros);
        } else {
          return findMatchingWildMacro(wildMacros, name);
        }
      } else {
        var createMacro = nameTree['create macro'];
        
        if (createMacro) {
          return nameTree['create macro'];
        } else {
          return findMatchingWildMacro(wildMacros, name);
        }
      }
    };
    
    return findMacroInTree(nameTreeRoot, name, 0, []);
  };
  
  this.invocation = function (name, arguments, optionalArguments) {
    var macro = this.findMacro(name);
    
    if (macro) {
      return macro(name, arguments, optionalArguments);
    } else {
      return functionCall(variable(name), arguments, optionalArguments);
    }
  };
};

var macros = exports.macros = new MacroDirectory();

var list = expressionTerm('list', function(items) {
  this.isList = true;
  this.items = items;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write('[');
    writeToBufferWithDelimiter(this.items, ',', buffer, scope);
    buffer.write(']');
  };
});

var hash = expressionTerm('hash', function(entries) {
  this.isHash = true;
  this.entries = entries;
  
  this.generateJavaScript = function(buffer, scope) {
    buffer.write('{');
    writeToBufferWithDelimiter(this.entries, ',', buffer, function (item) {
      item.generateJavaScriptHashEntry(buffer, scope);
    });
    buffer.write('}');
  };
});

var isLegalJavaScriptIdentifier = function(id) {
  return /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(id);
};

exports.hashEntries = function (entries) {
  return _.map(entries, function (entry) {
    return entry.hashEntry();
  });
};

var hashEntry = expressionTerm('hashEntry', function(field, value) {
  this.isHashEntry = true;
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

var ifCases = expressionTerm('ifCases', function (cases, _else) {
  this.isIfExpression = true;
  
  this.cases = cases;
  this._else = _else;

  this.generateJavaScriptStatement = function (buffer, scope, generateReturnStatements) {
    writeToBufferWithDelimiter(this.cases, 'else ', buffer, function (case_) {
      buffer.write('if(');
      case_.condition.generateJavaScript(buffer, scope);
      buffer.write('){');
      if (generateReturnStatements) {
        case_.action.generateJavaScriptReturn(buffer, scope);
      } else {
        case_.action.generateJavaScript(buffer, scope);
      }
      buffer.write('}');
    });

    if (this._else) {
      buffer.write('else{');
      if (generateReturnStatements) {
        this._else.generateJavaScriptReturn(buffer, scope);
      } else {
        this._else.generateJavaScript(buffer, scope);
      }
      buffer.write('}');
    }
  };

  this.generateJavaScript = function (buffer, scope) {
    functionCall(subExpression(block([], statements([this]))), []).generateJavaScript(buffer, scope);
  };

  this.generateJavaScriptReturn = function (buffer, scope) {
    this.generateJavaScriptStatement(buffer, scope, true);
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
    return [n];
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

var createForEach = function (basicExpression) {
  var args = basicExpression.arguments();
  var collection = args[0];
  var block = args[1];
  
  var itemVariable = block.parameters[0].parameter;
  
  return forEach(collection, itemVariable, block.body);
};

macros.addMacro(['for', 'each', 'in', 'do'], createForEach);
macros.addMacro(['for', 'each', 'in'], createForEach);

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
    return defs.concat(stmts.definitions(scope));
  };
});

macros.addMacro(['for'], function(basicExpression) {
  var args = basicExpression.arguments();
  var init = args[0].body.statements[0];
  var test = args[1].body.statements[0];
  var incr = args[2].body.statements[0];
  
  return forStatement(init, test, incr, args[3].body);
});

var whileStatement = expressionTerm('whileStatement', function(test, statements) {
  this.isWhile = true;
  this.test = test;
  this.statements = statements;
  
  this.generateJavaScript = function(buffer, scope) {
    buffer.write('while(');
    this.test.generateJavaScript(buffer, scope);
    buffer.write('){');
    this.statements.generateJavaScript(buffer, scope);
    buffer.write('}');
  };
  
  this.generateJavaScriptReturn = this.generateJavaScript;
  this.generateJavaScriptStatement = this.generateJavaScript;
});

macros.addMacro(['while'], function(basicExpression) {
  var args = basicExpression.arguments();
  var test = args[0].body.statements[0];
  var statements = args[1].body;
  
  return whileStatement(test, statements);
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
    
    if (this.arguments.length == 1) {
      buffer.write(op);
      this.arguments[0].generateJavaScript(buffer, scope);
    } else {
      this.arguments[0].generateJavaScript(buffer, scope);
      for(var n = 1; n < this.arguments.length; n++) {
        buffer.write(op);
        this.arguments[n].generateJavaScript(buffer, scope);
      }
    }
    
    buffer.write(')');
  };
});

var createOperator = function(expr) {
  return operator(expr.name()[0], expr.arguments());
};

_.each(['+', '*', '/', '-', '>=', '==', '!=', '===', '!==', '<=', '<', '>'], function(op) {
  macros.addMacro([op], createOperator);
});

macros.addMacro(['and'], function (expr) {
  return operator('&&', expr.arguments());
});

macros.addMacro(['or'], function (expr) {
  return operator('||', expr.arguments());
});

macros.addMacro(['not'], function (expr) {
  return operator('!', expr.arguments());
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

var throwStatement = expressionTerm('throwStatement', function(expr) {
  this.isThrow = true;
  this.expression = expr;
  this.generateJavaScriptStatement = function(buffer, scope) {
    buffer.write('throw ');
    this.expression.generateJavaScript(buffer, scope);
    buffer.write(';');
  };
  this.generateJavaScriptReturn = this.generateJavaScriptStatement;
});

macros.addMacro(['throw'], function(expr) {
  return throwStatement(expr.arguments()[0]);
});

var breakStatement = expressionTerm('breakStatement', function () {
  this.isBreak = true;
  this.generateJavaScriptStatement = function (buffer, scope) {
    buffer.write('break;');
  };
  this.generateJavaScriptReturn = this.generateJavaScriptStatement;
});

macros.addMacro(['break'], function(expr) {
  return breakStatement();
});

var continueStatement = expressionTerm('continueStatement', function () {
  this.isContinue = true;
  this.generateJavaScriptStatement = function (buffer, scope) {
    buffer.write('continue;');
  };
  this.generateJavaScriptReturn = this.generateJavaScriptStatement;
});

macros.addMacro(['continue'], function(expr) {
  return continueStatement();
});

var interpolation = exports.interpolation = new function () {
  this.stack = [];

  this.startInterpolation = function () {
    this.stack.unshift({brackets: 0});
  };

  this.openBracket = function () {
    this.stack[0].brackets++;
  };

  this.closeBracket = function () {
    this.stack[0].brackets--;
  };

  this.finishedInterpolation = function () {
    return this.stack[0].brackets < 0;
  };

  this.stopInterpolation = function () {
    this.stack.shift();
  };

  this.interpolating = function () {
    return this.stack.length > 0;
  };
};
