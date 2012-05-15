var _ = require('underscore');
var util = require('util');
var errors = require('../bootstrap/codeGenerator/errors');
require('../bootstrap/runtime');

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
  this.arguments = function () {
    return this;
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

  this.hashEntry = function () {
      errors.addTermWithMessage(this, 'cannot be used as a hash entry');
  };
  
  this.hashEntryField = function () {
    errors.addTermWithMessage(this, 'cannot be used as a field name');
  };

  this.blockify = function (parameters, optionalParameters) {
    var b = block(parameters, statements([this]));
    b.optionalParameters = optionalParameters;
    return b;
  };

  this.scopify = function () {
    return this;
  };

  this.parameter = function () {
    return errors.addTermWithMessage(this, 'this cannot be used as a parameter');
  };

  this.subterms = function () {
    this._subtermNames = Array.prototype.slice.call(arguments, 0);
  };
  
  this.mergeLocations = function (locations) {
    if (locations.length <= 0) {
      throw new Error('no locations for term: ' + this.inspectTerm() + '\n');
    }
    
    var firstLines = _.map(locations, function (l) {
      return l.firstLine;
    });
    
    var lastLines = _.map(locations, function (l) {
      return l.lastLine;
    });
    
    var firstColumns = _.map(locations, function (l) {
      return l.firstColumn;
    });
    
    var lastColumns = _.map(locations, function (l) {
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
    return _.compact(_.flatten(_.map(this._subtermNames, function (name) {
      return term[name];
    })));
  };
  
  this.walkEachSubterm = function (walker) {
    _.each(this.allSubterms(), function (subterm) {
      walker(subterm);
      subterm.walkEachSubterm(walker);
    });
  };
  
  this.location = function () {
    var term = this;
    
    return this._location || (this._location = (
      term.mergeLocations(_.map(term.allSubterms(), function (subterm) {
        return subterm.location();
      }))
    ));
  };

  this.derivedTerm = function (term) {
      return loc(term, this.location());
  };
};

var loc = exports.loc = function (term, location) {
  var loc = {
    firstLine: location.firstLine,
    lastLine: location.lastLine,
    firstColumn: location.firstColumn,
    lastColumn: location.lastColumn
  };

  term.location = function () {
    return loc;
  };
  
  return term;
};

var term = exports.term = function (members) {
  var constructor = function () {
    members.call(this);
  };
  constructor.prototype = ExpressionPrototype;
  return new constructor();
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
  return term(function () {
    this.isIdentifier = true;
    this.identifier = name;
    
    this.arguments = function () {
      return undefined;
    };
  });
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

var actualCharacters = [
  [/\\\\/g, '\\', /\\/g, '\\\\'],
  [/\\b/g, '\b', new RegExp('\b', 'g'), '\\b'],
  [/\\f/g, '\f', /\f/g, '\\f'],
  [/\\n/g, '\n', /\n/g, '\\n'],
  [/\\0/g, '\0', /\0/g, '\\0'],
  [/\\r/g, '\r', /\r/g, '\\r'],
  [/\\t/g, '\t', /\t/g, '\\t'],
  [/\\v/g, '\v', /\v/g, '\\v'],
  [/\\'/g, "'", /'/g, "\\'"],
  [/\\"/g, '"', /"/g, '\\"']
];

var formatJavaScriptString = function(s) {
  for (var i = 0; i < actualCharacters.length; i++) {
    var mapping = actualCharacters[i];
    s = s.replace(mapping[2], mapping[3]);
  }
  
  return "'" + s + "'";
};

var unindenter = function (columns) {
  var r = new RegExp('\\n {' + columns + '}', 'g');
  
  return function (s) {
    return s.replace(r,'\n');
  };
};

var unindent = exports.unindent = function (columns, text) {
  return unindenter(columns)(text);
};

expressionTerm('interpolatedString', function (components, columnStart) {
  this.isInterpolatedString = true;
  this.components = (function () {
    var removeIndentation = unindenter(columnStart + 1);
    
    var collapsedComponents = collapse(components, function (c) {
      if (c.isString) {
        return removeIndentation(c.string);
      }
    }, function (string, c) {
      if (c.isString) {
        return string + removeIndentation(c.string);
      }
    }, function (s) {
      return string(s);
    });

    return collapsedComponents;
  })();
  
  if (this.components.length === 1) {
    return this.components[0];
  } else if (this.components.length === 0) {
    return string('');
  }

  this.componentsDelimitedByStrings = function () {
    var comps = [];
    var lastComponentWasExpression = false;
    var lastComponentWasString = false;

    _.each(this.components, function (component) {
      if (lastComponentWasExpression && !component.isString) {
        comps.push(string(''));
      }
      
      if (lastComponentWasString && component.isString) {
        comps[comps.length - 1] = string(comps[comps.length - 1].string + component.string);
      } else {
        comps.push(component);
      }

      lastComponentWasExpression = !component.isString;
      lastComponentWasString = component.isString;
    });

    return comps;
  };

  this.generateJavaScript = function (buffer, scope) {
    writeToBufferWithDelimiter(this.componentsDelimitedByStrings(), '+', buffer, scope);
  };
});

var normaliseString = exports.normaliseString = function(s) {
  s = s.substring(1, s.length - 1);
  
  return s.replace(/''/g, "'");
};

var normaliseRegExp = exports.normaliseRegExp = function(s) {
  s = s.substring(1, s.length - 1);
  
  return s.replace(/\\`/g, "`");
};

var parseRegExp = exports.parseRegExp = function (s) {
  var match = /^r\/((\n|.)*)\/([^\/]*)$/.exec(s);
  
  return {
    pattern: match[1].replace(/\\\//g, '/').replace(/\n/, '\\n'),
    options: match[3]
  }
};

var normaliseInterpolatedString = exports.normaliseInterpolatedString = function (s) {
  for (var i = 0; i < actualCharacters.length; i++) {
    var mapping = actualCharacters[i];
    s = s.replace(mapping[0], mapping[1]);
  }

  return s;
};

var string = expressionTerm('string', function(value) {
  this.isString = true;
  this.string = value;
  this.generateJavaScript = function(buffer, scope) {
    buffer.write(formatJavaScriptString(this.string));
  };
});

var regExp = exports.regExp = function (patternOptions) {
  return term(function () {
    this.isRegExp = true;
    this.pattern = patternOptions.pattern;
    this.options = patternOptions.options;
    
    this.generateJavaScript = function (buffer, scope) {
      buffer.write('/' + this.pattern.replace(/\//g, '\\/') + (this.options? '/' + this.options: '/'));
    };
  });
};

expressionTerm('float', function (value) {
  this.float = value;
  this.generateJavaScript = function (buffer, scope) {
    buffer.write(this.float.toString());
  };
});

var variable = expressionTerm('variable', function (name, options) {
  this.variable = name;
  this.isVariable = true;
  this.shadow = options && options.shadow;
  
  this.generateJavaScript = function (buffer, scope) {
    buffer.write(concatName(this.variable));
  };
  
  this.generateJavaScriptTarget = this.generateJavaScript;
  
  this.hashEntryField = function () {
    return this.variable;
  };
  
  this.generateJavaScriptParameter = this.generateJavaScript;
  
  this.definitionName = function(scope) {
    if (this.shadow || !scope.isDefined(concatName(this.variable))) {
      return this.variable;
    }
  };
  
  this.parameter = function () {
    return this;
  };
});

var selfExpression = exports.selfExpression = function () {
  return variable(['self'], {shadow: true});
};

var asyncArgument = exports.asyncArgument = function () {
  return term(function () {
    this.isAsyncArgument = true;
    
    this.arguments = function () {
      return [];
    };
  });
}

var parameters = exports.parameters = function (parms) {
  return term(function () {
    this.isParameters = true;
    this.parameters = parms;
    
    this.arguments = function () {
      return [];
    };
  });
};

var concatName = exports.concatName = function (nameSegments) {
  var name = '';
  
  for (var n = 0; n < nameSegments.length; n++) {
    var segment = nameSegments[n];
    name += nameSegmentRenderedInJavaScript(segment, n === 0);
  }
  
  return name;
};

var nameSegmentRenderedInJavaScript = function (nameSegment, isFirst) {
  if (/[_$a-zA-Z0-9]+/.test(nameSegment)) {
    if (isFirst) {
      return nameSegment;
    } else {
      return capitalise(nameSegment);
    }
  } else {
    return operatorRenderedInJavaScript(nameSegment);
  }
};

var capitalise = function (s) {
  return s[0].toUpperCase() + s.substring(1);
};

var operatorRenderedInJavaScript = function (operator) {
  var javaScriptName = '';
  for (var n = 0; n < operator.length; n++) {
    javaScriptName += '$' + operator.charCodeAt(n).toString(16);
  }
  return javaScriptName;
};

var javascript = exports.javascript = function (source) {
  return term(function () {
    this.isJavaScript = true;
    this.source = source;
    this.generateJavaScript = function (buffer, scope) {
      buffer.write(this.source);
    };
  });
};

var splatParameters = function (next) {
  return new function () {
    this.parsedSplatParameters = parseSplatParameters(next.parameters());

    this.parameters = function () {
      return this.parsedSplatParameters.firstParameters;
    };
  
    this.statements = function () {
      var splat = this.parsedSplatParameters;
      
      if (splat.splatParameter) {
        var lastIndex = 'arguments.length';
      
        if (splat.lastParameters.length > 0) {
          lastIndex += ' - ' + splat.lastParameters.length;
        }
      
        var splatParameter =
          definition(
            splat.splatParameter,
            javascript('Array.prototype.slice.call(arguments, ' + splat.firstParameters.length + ', ' + lastIndex + ')')
          );
      
        var lastParameterStatements = [splatParameter];
        for (var n = 0; n < splat.lastParameters.length; n++) {
          var param = splat.lastParameters[n];
          lastParameterStatements.push(
            definition(
              param,
              javascript('arguments[arguments.length - ' + (splat.lastParameters.length - n) + ']')
            )
          );
        }

        return lastParameterStatements.concat(next.statements());
      } else {
        return next.statements();
      }
    };
    
    this.hasSplat = this.parsedSplatParameters.splatParameter;
  };
};

var parseSplatParameters = exports.parseSplatParameters = function (parameters) {
  var firstParameters = take(parameters, function (param) {
    return !param.isSplat;
  });
  
  var maybeSplat = parameters[firstParameters.length];
  var splatParam, lastParameters;
  
  if (maybeSplat && maybeSplat.isSplat) {
    splatParam = firstParameters.pop();
    splatParam.shadow = true;
    lastParameters = parameters.slice(firstParameters.length + 2);
    
    lastParameters = _.filter(lastParameters, function (param) {
      if (param.isSplat) {
        errors.addTermWithMessage(param, 'cannot have more than one splat parameter');
        return false;
      } else {
        return true;
      }
    });
  } else {
    lastParameters = [];
  }
  
  return {
    firstParameters: firstParameters,
    splatParameter: splatParam,
    lastParameters: lastParameters
  };
};

var take = function (list, canTake) {
  var takenList = [];
  
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (canTake(item)) {
      takenList.push(item);
    } else {
      return takenList;
    }
  }
  
  return takenList;
};

var splattedArguments = function (args, optionalArgs) {
  var splatArgs = [];
  var previousArgs = [];
  var foundSplat = false;
  
  for (var i = 0; i < args.length; i++) {
    var current = args[i];
    var next = args[i+1];
    if (next && next.isSplat) {
      foundSplat = true;
      if (previousArgs.length > 0) {
        splatArgs.push(list(previousArgs));
        previousArgs = [];
      }
      splatArgs.push(current);
      i++;
    } else if (current.isSplat) {
      errors.addTermWithMessage(current, 'splat keyword with no argument to splat');
    } else {
      previousArgs.push(current);
    }
  }
  
  if (optionalArgs && optionalArgs.length > 0) {
    previousArgs.push(hash(optionalArgs));
  }
  
  if (previousArgs.length > 0) {
    splatArgs.push(list(previousArgs));
  }
  
  if (foundSplat) {
    return term(function () {
      this.generateJavaScript = function (buffer, scope) {
        for (var i = 0; i < splatArgs.length; i++) {
          var splattedArgument = splatArgs[i];

          if (i === 0) {
            splattedArgument.generateJavaScript(buffer, scope);
          } else {
            buffer.write('.concat(');
            splattedArgument.generateJavaScript(buffer, scope);
            buffer.write(')');
          }
        }
      }
    });
  }
};

var functionCall = expressionTerm('functionCall', function (fun, args, optionalArgs) {
  this.isFunctionCall = true;

  this.function = fun;
  this.arguments = args;
  this.optionalArguments = optionalArgs;
  this.splattedArguments = splattedArguments(args, optionalArgs);
  
  this.subterms('function', 'arguments', 'optionalArguments');

  this.generateJavaScript = function (buffer, scope) {
    fun.generateJavaScript(buffer, scope);
    
    var args = argsAndOptionalArgs(this.arguments, this.optionalArguments);
    
    if (this.splattedArguments && this.function.isIndexer) {
      buffer.write('.apply(');
      this.function.object.generateJavaScript(buffer, scope);
      buffer.write(',');
      this.splattedArguments.generateJavaScript(buffer, scope);
      buffer.write(')');
    } else if (this.splattedArguments) {
      buffer.write('.apply(null,');
      this.splattedArguments.generateJavaScript(buffer, scope);
      buffer.write(')');
    } else {
      buffer.write('(');
      writeToBufferWithDelimiter(args, ',', buffer, scope);
      buffer.write(')');
    }
  };
});

var optional = expressionTerm('optional', function (options, name, defaultValue) {
  this.options = options;
  this.name = name;
  this.defaultValue = defaultValue;
  
  this.properDefaultValue = function () {
    if (this.defaultValue === undefined) {
      return variable(['undefined']);
    } else {
      return this.defaultValue;
    }
  };

  this.generateJavaScript = function (buffer, scope) {
    buffer.write('(');
    this.options.generateJavaScript(buffer, scope);
    buffer.write('&&');
    this.options.generateJavaScript(buffer, scope);
    buffer.write('.' + concatName(this.name) + "!=null)?");
    this.options.generateJavaScript(buffer, scope);
    buffer.write('.' + concatName(this.name) + ':');
    this.properDefaultValue().generateJavaScript(buffer, scope);
  };
});

var selfParameter = function (redefinesSelf, next) {
  if (redefinesSelf) {
    return {
      parameters: function () {
        return next.parameters();
      },
    
      statements: function () {
        return [definition(selfExpression(), variable(['this']))].concat(next.statements());
      }
    };
  } else {
    return next;
  }
};

var blockParameters = function (block) {
  return {
    parameters: function () {
      return block.parameters;
    },
    
    statements: function () {
      return block.body.statements;
    }
  }
};

var optionalParameters = function (optionalParameters, next) {
  if (optionalParameters.length > 0) {
    return {
      options: generatedVariable(['options']),
      
      parameters: function () {
        return next.parameters().concat([this.options]);
      },
    
      statements: function () {
        var self = this;

        var optionalStatements = _.map(optionalParameters, function (parm) {
          return definition(variable(parm.field, {shadow: true}), optional(self.options, parm.field, parm.value));
        });
        
        return optionalStatements.concat(next.statements());
      },
      
      hasOptionals: true
    };
  } else {
    return next;
  }
};

var block = expressionTerm('block', function (parameters, body, options) {
  this.body = body;
  this.isBlock = true;
  this.returnLastStatement = options && options.returnLastStatement != null? options.returnLastStatement: true;
  this.parameters = parameters;
  this.optionalParameters = [];
  this.redefinesSelf = options && options.redefinesSelf != null? options.redefinesSelf: false;
  
  this.blockify = function (parameters, optionalParameters) {
    this.parameters = parameters;
    this.optionalParameters = optionalParameters;
    return this;
  };
  
  this.scopify = function () {
    if (this.parameters.length === 0 && this.optionalParameters.length === 0) {
      return scope(this.body.statements);
    } else {
      return this;
    }
  };
  
  this.parameterTransforms = function () {
    if (this._parameterTransforms) {
      return this._parameterTransforms;
    }
    
    var optionals = optionalParameters(
      this.optionalParameters,
      selfParameter(
        this.redefinesSelf,
        blockParameters(this)
      )
    );
    
    var splat = splatParameters(
      optionals
    );
    
    if (optionals.hasOptionals && splat.hasSplat) {
      errors.addTermsWithMessage(this.optionalParameters, 'cannot have splat parameters with optional parameters');
    }
    
    return this._parameterTransforms = splat;
  };
  
  
  this.transformedStatements = function () {
    return statements(this.parameterTransforms().statements());
  };
  
  this.transformedParameters = function () {
    return this.parameterTransforms().parameters();
  };

  this.generateJavaScript = function (buffer, scope) {
    buffer.write('function(');
    writeToBufferWithDelimiter(this.transformedParameters(), ',', buffer, scope);
    buffer.write('){');
    var body = this.transformedStatements();
    if (this.returnLastStatement) {
      body.generateJavaScriptStatementsReturn(buffer, scope.subScope());
    } else {
      body.generateJavaScriptStatements(buffer, scope.subScope());
    }
    buffer.write('}');
  };
});

var writeToBufferWithDelimiter = function (array, delimiter, buffer, scope) {
  var writer;
  if (typeof scope === 'function') {
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

var methodCall = exports.methodCall = function (object, name, args, optionalArgs) {
  var splattedArgs = splattedArguments(args, optionalArgs);
  
  if (splattedArgs) {
    var objectVar = generatedVariable(['o']);
    return expressionStatements(statements([
      definition(objectVar, object),
      methodCall(
        fieldReference(objectVar, name),
        ['apply'],
        [objectVar, splattedArgs]
      )
    ]));
  } else {
    return term(function () {
      this.isMethodCall = true;
      this.object = object;
      this.name = name;
      this.arguments = args;
      this.optionalArguments = optionalArgs;
      
      this.subterms('object', 'arguments', 'optionalArguments');

      this.generateJavaScript = function (buffer, scope) {
        this.object.generateJavaScript(buffer, scope);
        buffer.write('.');
        buffer.write(concatName(this.name));
        buffer.write('(');
        writeToBufferWithDelimiter(argsAndOptionalArgs(this.arguments, this.optionalArguments), ',', buffer, scope);
        buffer.write(')');
      };
    });
  }
};

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

var expressionStatements = function (statements) {
  return objectExtending(statements, function () {
    this.isExpressionStatements = true;
  });
};

var Statements = function (statements) {
  return term(function () {
    this.isStatements = true;
    this.statements = statements;
    
    this.subterms('statements');

    this.generateStatements = function (statements, buffer, scope, global) {
      var self = this;
      
      hasScope(scope);

      var namesDefined = _(this.statements).chain().reduce(function (list, statement) {
        var defs = statement.definitions(scope);
        return list.concat(defs);
      }, []).map(function (name) {
        return concatName(name);
      }).uniq().value();

      if (namesDefined.length > 0) {
        _(namesDefined).each(function (name) {
          scope.define(name);
        });

        if (!global) {
          buffer.write ('var ');
          writeToBufferWithDelimiter(namesDefined, ',', buffer, function (item) {
            buffer.write(item);
          });
          buffer.write(';');
        }
      }

      _(statements).each(function (statement) {
        self.writeSubStatementsForAllSubTerms(statement, buffer, scope);
        statement.generateJavaScriptStatement(buffer, scope);
      });
    };
    
    this.writeSubStatements = function (subterm, buffer, scope) {
      if (subterm.isExpressionStatements) {
        var statements = subterm;
        if (statements.statements.length > 0) {
          statements.generateStatements(statements.statements.slice(0, statements.statements.length - 1), buffer, scope);
        }
      }
    };
    
    this.writeSubStatementsForAllSubTerms = function (statement, buffer, scope) {
      var self = this;
      this.writeSubStatements(statement, buffer, scope);
      statement.walkEachSubterm(function (subterm) {
        self.writeSubStatements(subterm, buffer, scope);
      });
    };

    this.generateJavaScriptStatements = function (buffer, scope, global) {
      this.generateStatements(this.statements, buffer, scope, global);
    };

    this.blockify = function (parameters, optionalParameters) {
      var b = block(parameters, this);
      b.optionalParameters = optionalParameters;
      return b;
    };

    this.scopify = function () {
      return functionCall(block([], this), []);
    };

    this.generateJavaScriptStatementsReturn = function (buffer, scope, global) {
      if (this.statements.length > 0) {
        this.generateStatements(this.statements.slice(0, this.statements.length - 1), buffer, scope, global);
        var returnStatement = this.statements[this.statements.length - 1];
        this.writeSubStatementsForAllSubTerms(returnStatement, buffer, scope);
        returnStatement.generateJavaScriptReturn(buffer, scope);
      }
    };

    this.generateJavaScript = function (buffer, scope) {
      if (this.statements.length > 0) {
        this.statements[this.statements.length - 1].generateJavaScript(buffer, scope);
      }
    };

    this.generateJavaScriptStatement = function (buffer, scope) {
      if (this.statements.length > 0) {
        this.statements[this.statements.length - 1].generateJavaScriptStatement(buffer, scope);
      }
    };

    this.generateJavaScriptReturn = function (buffer, scope) {
      if (this.statements.length > 0) {
        this.statements[this.statements.length - 1].generateJavaScriptReturn(buffer, scope);
      }
    };

    this.definitions = function(scope) {
      return _(statements).reduce(function (list, statement) {
        var defs = statement.definitions(scope);
        return list.concat(defs);
      }, []);
    };
  });
};

var module = expressionTerm('module', function (statements) {
  this.statements = statements;
  this.isModule = true;
  this.inScope = true;
  this.global = false;
  this.returnResult = false;
  
  this.generateJavaScript = function (buffer, scope, global) {
    if (this.inScope) {
      var b = block([], this.statements, {returnLastStatement: false, redefinesSelf: true});
      methodCall(subExpression(b), ['call'], [variable(['this'])]).generateJavaScript(buffer, new Scope());
      buffer.write(';');
    } else {
      if (this.returnResult) {
        this.statements.generateJavaScriptStatementsReturn(buffer, new Scope(), this.global);
      } else {
        this.statements.generateJavaScriptStatements(buffer, new Scope(), this.global);
      }
    }
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
    return variables.hasOwnProperty(name) || (parentScope && parentScope.isDefined(name));
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
  if (!target) throw Error();
  
  this.isDefinition = true;
  this.target = target;
  this.source = source;

  this.subterms('target', 'source');

  this.expression = function () {
    return this;
  };
  
  this.hashEntry = function () {
    return hashEntry(this.target.hashEntryField(), this.source);
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
      if (args.length === 1) {
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

    if (name.length === 0 && terminals.length > 1) {
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

    if (name.length > 0 && args.length === 1) {
      return hashEntry(name, args[0]);
    }
    
    if (name.length > 0 && args.length === 0) {
      return hashEntry(name, boolean(true));
    }
    
    if (name.length === 0 && args.length === 2 && args[0].isString) {
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
    return (this.name().length > 0) && (this.arguments().length === 0);
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
    return this.terminals.length === 1;
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
      if (!nameTree.hasOwnProperty(nameSegment)) {
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
    
    var matchMacros;
    if (!nameTree.hasOwnProperty('match macro')) {
      matchMacros = nameTree['match macro'] = [];
    } else {
      matchMacros = nameTree['match macro'];
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
        if (nameTree.hasOwnProperty(name[index])) {
          var subtree = nameTree[name[index]];
          if (subtree.hasOwnProperty('match macro')) {
            wildMacros = subtree['match macro'].concat(wildMacros);
          }
          return findMacroInTree(subtree, name, index + 1, wildMacros);
        } else {
          return findMatchingWildMacro(wildMacros, name);
        }
      } else {
        if (nameTree.hasOwnProperty('create macro')) {
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
    } else if (arguments) {
      return functionCall(variable(name), arguments, optionalArguments);
    } else {
      return variable(name);
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
  
  this.subterms('value');

  this.legalFieldName = function () {
    if (this.field.isString) {
      return formatJavaScriptString(this.field.string);
    }
    var f = concatName(this.field);
    if (isLegalJavaScriptIdentifier(f)) {
      return f;
    } else {
      return formatJavaScriptString(f);
    }
  }

  this.valueOrTrue = function () {
    if (this.value === undefined) {
      return boolean(true);
    } else {
      return this.value;
    }
  };
  
  this.generateJavaScriptHashEntry = function(buffer, scope) {
    var f = concatName(this.field);
    buffer.write(this.legalFieldName());
    buffer.write(':');
    this.valueOrTrue().generateJavaScript(buffer, scope);
  };
});

var ifCases = expressionTerm('ifCases', function (cases, _else) {
  this.isIfExpression = true;
  
  this.cases = cases;
  this._else = _else;

  this.allSubterms = function () {
    var subterms = _.flatten(_.map(this.cases, function (c) {
      return [c.condition, c.action];
    }));
    
    if (this._else) {
      subterms.push(this._else);
    }
    return subterms;
  };

  this.generateJavaScriptStatement = function (buffer, scope, generateReturnStatements) {
    writeToBufferWithDelimiter(this.cases, 'else ', buffer, function (case_) {
      buffer.write('if(');
      case_.condition.generateJavaScript(buffer, scope);
      buffer.write('){');
      if (generateReturnStatements) {
        case_.action.generateJavaScriptStatementsReturn(buffer, scope);
      } else {
        case_.action.generateJavaScriptStatements(buffer, scope);
      }
      buffer.write('}');
    });

    if (this._else) {
      buffer.write('else{');
      if (generateReturnStatements) {
        this._else.generateJavaScriptStatementsReturn(buffer, scope);
      } else {
        this._else.generateJavaScriptStatements(buffer, scope);
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
  
  this.generateJavaScriptParameter = this.generateJavaScript;
  
  this.generateJavaScriptTarget = this.generateJavaScript;
  
  this.definitionName = function(scope) {
    var n = this.generatedName(scope);
    if (!scope.isDefined(concatName([n]))) {
      return [n];
    }
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

  var s = [definition(itemVariable, indexer(itemsVar, indexVar))];
  s.push.apply(s, stmts.statements);
  
  // s = [subExpression(functionCall(block([itemVariable], stmts, {returnLastStatement: false}), [indexer(itemsVar, indexVar)]))];
  
  var statementsWithItemAssignment = statements(s);
  
  var init = definition(indexVar, integer(0));
  var test = operator('<', [indexVar, fieldReference(itemsVar, ['length'])]);
  var incr = postIncrement(indexVar);
  
  return expressionStatements(statements([
    definition(itemsVar, collection),
    forStatement(init, test, incr, statementsWithItemAssignment)
  ]));
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
    subExpression(functionCall(block([this.indexVariable], this.statements, {returnLastStatement: false}), [this.indexVariable])).generateJavaScriptStatement(buffer, scope);
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
    return defs;
  };
});

var forIn = expressionTerm('forIn', function(iterator, collection, stmts) {
  this.isForIn = true;
  this.iterator = iterator;
  this.collection = collection;
  this.statements = stmts;
  
  this.generateJavaScript = function(buffer, scope) {
    buffer.write('for(var ');
    this.iterator.generateJavaScript(buffer, scope);
    buffer.write(' in ');
    this.collection.generateJavaScript(buffer, scope);
    buffer.write('){');
    subExpression(functionCall(block([this.iterator], this.statements, {returnLastStatement: false}), [this.iterator])).generateJavaScriptStatement(buffer, scope);
    buffer.write('}');
  };
  this.generateJavaScriptStatement = this.generateJavaScript;
  this.generateJavaScriptReturn = this.generateJavaScript;
  
  this.definitions = function(scope) {
    var defs = [];
    var indexName = this.iterator.definitionName(scope);
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
    this.statements.generateJavaScriptStatements(buffer, scope);
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

var scope = exports.scope = function (stmts, options) {
  return term(function () {
    this.isScope = true;
    this.statements = stmts;
    this.alwaysGenerateFunction = options != null? options.alwaysGenerateFunction: undefined;
    
    this.subterms('statements');
    
    this.generateJavaScript = function (buffer, scope) {
      if (this.statements.length === 1 && !this.alwaysGenerateFunction) {
        this.statements[0].generateJavaScript(buffer, scope);
      } else {
        functionCall(subExpression(block([], statements(this.statements))), []).generateJavaScript(buffer, scope);
      }
    };
  });
}

var normaliseArguments = exports.normaliseArguments = function (args) {
  return _(args).map(function (arg) {
    if (arg.length === 1) {
      return arg;
    } else if (arg.length > 1) {
      return scope(arg);
    } else {
      throw new Error("this shouldn't happen!")
    }
  });
};

var subExpression = exports.subExpression = function (expression) {
  return term(function () {
    this.isSubExpression = true;
    this.expression = expression;

    this.subterms('expression');

    this.generateJavaScript = function (buffer, scope) {
      buffer.write('(');
      this.expression.generateJavaScript(buffer, scope);
      buffer.write(')');
    };
  });
};

var argumentList = exports.argumentList = function (args) {
  return term(function () {
    this.isArgumentList = true;
    this.args = args;

    this.subterms('args');
    
    this.arguments = function () {
      return this.args;
    };
  });
};

var tryStatement = exports.tryStatement = function (body, catchBody, finallyBody) {
  return term(function () {
    this.isTryStatement = true;
    this.body = body;
    this.catchBody = catchBody;
    this.finallyBody = finallyBody;

    this.generateJavaScriptStatement = function (buffer, scope, returnStatements) {
      buffer.write('try{');
      if (returnStatements) {
        this.body.generateJavaScriptStatementsReturn(buffer, scope);
      } else {
        this.body.generateJavaScriptStatements(buffer, scope);
      }
      buffer.write('}');
      if (this.catchBody) {
        buffer.write('catch(');
        this.catchBody.parameters[0].generateJavaScript(buffer, scope);
        buffer.write('){');
        if (returnStatements) {
          this.catchBody.body.generateJavaScriptStatementsReturn(buffer, scope);
        } else {
          this.catchBody.body.generateJavaScriptStatements(buffer, scope);
        }
        buffer.write('}');
      }
      if (this.finallyBody) {
        buffer.write('finally{');
        if (returnStatements) {
          this.finallyBody.generateJavaScriptStatementsReturn(buffer, scope);
        } else {
          this.finallyBody.generateJavaScriptStatements(buffer, scope);
        }
        buffer.write('}');
      }
    };
    
    this.generateJavaScriptReturn = function (buffer, scope) {
      this.generateJavaScriptStatement(buffer, scope, true);
    };

    this.generateJavaScript = function (buffer, symbolScope) {
      if (this.alreadyCalled) {
        throw new Error('stuff');
      }
      this.alreadyCalled = true;
      scope([this], {alwaysGenerateFunction: true}).generateJavaScript(buffer, symbolScope);
    };
  });
};

var operator = expressionTerm('operator', function (op, args) {
  this.isOperator = true;
  this.operator = op;
  this.arguments = args;

  this.isOperatorAlpha = function () {
    return /[a-zA-Z]+/.test(this.operator);
  };

  this.generateJavaScript = function(buffer, scope) {
    buffer.write('(');
    
    if (this.arguments.length === 1) {
      buffer.write(op);
      if (this.isOperatorAlpha()) {
        buffer.write(' ');
      }
      this.arguments[0].generateJavaScript(buffer, scope);
    } else {
      var alpha = this.isOperatorAlpha();
      
      this.arguments[0].generateJavaScript(buffer, scope);
      for(var n = 1; n < this.arguments.length; n++) {
        if (alpha) {
          buffer.write(' ');
        }
        buffer.write(op);
        if (alpha) {
          buffer.write(' ');
        }
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
    if (this.expression) {
      this.expression.generateJavaScriptReturn(buffer, scope);
    } else {
      buffer.write('return;');
    }
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

exports.splat = function () {
  return term(function () {
    this.isSplat = true;
    
    this.parameter = function () {
      return this;
    };
  });
};

var collapse = exports.collapse = function (list, isGroup, collapseItemIntoGroup, maybeFinishGroup) {
  var currentGroup;
  var collapsedList = [];
  
  var finishGroup;
  
  if (maybeFinishGroup) {
    finishGroup = maybeFinishGroup;
  } else {
    finishGroup = function (group) {
      return group;
    }
  }
  
  for (var n = 0; n < list.length; n++) {
    var item = list[n];
    if (currentGroup) {
      var newGroup = collapseItemIntoGroup(currentGroup, item);
      if (newGroup) {
        currentGroup = newGroup;
        continue;
      }
    }
    
    var group = isGroup(item);
    if (typeof group != 'undefined') {
      currentGroup = group;
    } else {
      if (currentGroup) {
        collapsedList.push(finishGroup(currentGroup));
        currentGroup = null;
      }
      collapsedList.push(item);
    }
  }
  
  if (currentGroup) {
    collapsedList.push(finishGroup(currentGroup));
  }
  
  return collapsedList;
};
