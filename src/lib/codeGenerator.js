var _ = require('underscore');

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
  this.definitions = function () {
    return [];
  };
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

expressionTerm('integer', function (value) {
  this.integer = value;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write(this.integer.toString());
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

expressionTerm('indexer', function (object, indexer) {
  this.object = object;
  this.indexer = indexer;
  this.isIndexer = true;
  this.generateJavaScript = function (buffer, scope) {
    this.object.generateJavaScript(buffer, scope);
    buffer.write('[');
    this.indexer.generateJavaScript(buffer, scope);
    buffer.write(']');
  };
});

expressionTerm('fieldReference', function (object, name) {
  this.object = object;
  this.name = name;
  this.isFieldReference = true;
  this.generateJavaScript = function (buffer, scope) {
    this.object.generateJavaScript(buffer, scope);
    buffer.write('.');
    buffer.write(concatName(this.name));
  };
});

var hasScope = function (s) {
  if (!s) {
    console.log('---------------- NO SCOPE! -----------------');
    throw new Error('no scope');
  }
};

var Statements = function (statements) {
  this.statements = statements;
  
  var generateStatements = function (statements, buffer, scope) {
    hasScope(scope);
    
    var namesDefined = _(statements).chain().reduce(function (list, statement) {
      var defs = statement.definitions();
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
    generateStatements(this.statements, buffer, scope);
  };
  
  this.generateJavaScriptReturn = function (buffer, scope) {
    if (this.statements.length > 0) {
      generateStatements(this.statements.splice(0, this.statements.length - 1), buffer, scope);
      this.statements[this.statements.length - 1].generateJavaScriptReturn(buffer, scope);
    }
  };
};

expressionTerm('module', function (statements) {
  this.statements = statements;
  
  this.generateJavaScript = function (buffer, scope) {
    this.statements.generateJavaScript(buffer, new Scope());
  };
});

var Scope = exports.Scope = function (parentScope) {
  var variables = {};
  
  this.define = function (name) {
    variables[name] = true;
  };
  
  this.isDefined = function (name) {
    return variables[name] || (parentScope && parentScope.isDefined(name));
  };
  
  this.subScope = function () {
    return new Scope(this);
  };
};

var statements = exports.statements = function (s) {
  return new Statements(s);
};

expressionTerm('definition', function (target, source) {
  this.target = target;
  this.source = source;
  
  this.generateJavaScript = function (buffer, scope) {
    target.generateJavaScript(buffer, scope);
    buffer.write('=');
    source.generateJavaScript(buffer, scope);
  };
  this.definitions = function () {
    return [target.variable];
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
    var name = _(this.terminals).map(function (terminal) {
      return terminal.identifier;
    });
    
    return variable(name);
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

var List = function(items) {
  this.list = items;
};
List.prototype = ExpressionPrototype;

macros.addMacro(['list'], function(expression) {
  return new List(expression.arguments());
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

var subExpression = expressionTerm('subExpression', function (expr) {
  this.expression = expr;
  
  this.generateJavaScript = function(buffer, scope) {
    buffer.write('(');
    this.expression.generateJavaScript(buffer, scope);
    buffer.write(')');
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
