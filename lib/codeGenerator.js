var _ = require('underscore');
var util = require('util');
require('../src/bootstrap/runtime');
var codegenUtils = require('./codegenUtils');

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

exports.oldTerm = function (members) {
  var cg = this;
  
  var constructor = function () {
    members.call(this);
  };
  constructor.prototype = cg.termPrototype;
  return new constructor();
};

var actualCharacters = [
  [/\\/g, '\\\\'],
  [new RegExp('\b', 'g'), '\\b'],
  [/\f/g, '\\f'],
  [/\n/g, '\\n'],
  [/\0/g, '\\0'],
  [/\r/g, '\\r'],
  [/\t/g, '\\t'],
  [/\v/g, '\\v'],
  [/'/g, "\\'"],
  [/"/g, '\\"']
];

var formatJavaScriptString = function(s) {
  for (var i = 0; i < actualCharacters.length; i++) {
    var mapping = actualCharacters[i];
    s = s.replace(mapping[0], mapping[1]);
  }
  
  return "'" + s + "'";
};

exports.interpolatedString = function (components) {
  var cg = this;

  if (components.length === 1) {
    return components[0];
  } else if (components.length === 0) {
    return cg.string('');
  } else {
    return this.oldTerm(function () {
      this.isInterpolatedString = true;
      this.components = components;

      this.componentsDelimitedByStrings = function () {
        var self = this;
        var comps = [];
        var lastComponentWasExpression = false;
        var lastComponentWasString = false;

        _.each(this.components, function (component) {
          if (lastComponentWasExpression && !component.isString) {
            comps.push(self.cg.string(''));
          }
      
          if (lastComponentWasString && component.isString) {
            comps[comps.length - 1] = self.cg.string(comps[comps.length - 1].string + component.string);
          } else {
            comps.push(component);
          }

          lastComponentWasExpression = !component.isString;
          lastComponentWasString = component.isString;
        });

        return comps;
      };

      this.generateJavaScript = function (buffer, scope) {
        codegenUtils.writeToBufferWithDelimiter(this.componentsDelimitedByStrings(), '+', buffer, scope);
      };
    });
  }
};

exports.string = function(value) {
  return this.oldTerm(function () {
    this.isString = true;
    this.string = value;
    this.generateJavaScript = function(buffer, scope) {
      buffer.write(formatJavaScriptString(this.string));
    };
  });
};

exports.regExp = function (patternOptions) {
  return this.oldTerm(function () {
    this.isRegExp = true;
    this.pattern = patternOptions.pattern;
    this.options = patternOptions.options;
    
    this.generateJavaScript = function (buffer, scope) {
      buffer.write('/' + this.pattern.replace(/\//g, '\\/') + (this.options? '/' + this.options: '/'));
    };
  });
};

exports.variable = function (name, options) {
  return this.oldTerm(function () {
    this.variable = name;
    this.isVariable = true;
    this.shadow = options && options.shadow;
  
    this.variableName = function () {
      return this.cg.concatName(this.variable, {escape: true});
    };
  
    this.generateJavaScript = function (buffer, scope) {
      buffer.write(this.variableName());
    };
  
    this.generateJavaScriptTarget = this.generateJavaScript;
  
    this.hashEntryField = function () {
      return this.variable;
    };
  
    this.generateJavaScriptParameter = this.generateJavaScript;
  
    this.definitionName = function(scope) {
      if (this.shadow || !scope.isDefined(this.variableName())) {
        return this.variableName();
      }
    };
  
    this.parameter = function () {
      return this;
    };
  });
};

exports.selfExpression = function () {
  return this.variable(['self'], {shadow: true});
};

exports.asyncArgument = function () {
  return this.oldTerm(function () {
    this.isAsyncArgument = true;
    
    this.arguments = function () {
      return [];
    };
  });
};

exports.parameters = function (parms) {
  return this.oldTerm(function () {
    this.isParameters = true;
    this.parameters = parms;
    
    this.arguments = function () {
      return [];
    };
  });
};

exports.concatName = function (nameSegments, options) {
  var name = '';
  
  for (var n = 0; n < nameSegments.length; n++) {
    var segment = nameSegments[n];
    name += nameSegmentRenderedInJavaScript(segment, n === 0);
  }

  if (options && options.hasOwnProperty('escape') && options.escape)
    return escapeReservedWord(name);
  else
    return name;
};

var reservedWords = {
  'class': true,
  'function': true
};

var escapeReservedWord = function (word) {
  if (reservedWords.hasOwnProperty(word)) {
    return '$' + word;
  } else {
    return word;
  }
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

exports.javascript = function (source) {
  return this.oldTerm(function () {
    this.isJavaScript = true;
    this.source = source;
    this.generateJavaScript = function (buffer, scope) {
      buffer.write(this.source);
    };
  });
};

var splattedArguments = function (cg, args, optionalArgs) {
  var splatArgs = [];
  var previousArgs = [];
  var foundSplat = false;
  
  for (var i = 0; i < args.length; i++) {
    var current = args[i];
    var next = args[i+1];
    if (next && next.isSplat) {
      foundSplat = true;
      if (previousArgs.length > 0) {
        splatArgs.push(cg.list(previousArgs));
        previousArgs = [];
      }
      splatArgs.push(current);
      i++;
    } else if (current.isSplat) {
      cg.errors.addTermWithMessage(current, 'splat keyword with no argument to splat');
    } else {
      previousArgs.push(current);
    }
  }
  
  if (optionalArgs && optionalArgs.length > 0) {
    previousArgs.push(cg.hash(optionalArgs));
  }
  
  if (previousArgs.length > 0) {
    splatArgs.push(cg.list(previousArgs));
  }
  
  if (foundSplat) {
    return cg.oldTerm(function () {
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

exports.functionCall = function (fun, args, optionalArgs) {
  var cg = this;
  return this.oldTerm(function () {
    this.isFunctionCall = true;

    this.function = fun;
    this.functionArguments = args;
    this.optionalArguments = optionalArgs;
    this.splattedArguments = splattedArguments(cg, args, optionalArgs);
    this.passThisToApply = false;

    this.hasSplatArguments = function () {
      return this.splattedArguments;
    };
  
    this.subterms('function', 'functionArguments', 'optionalArguments');

    this.generateJavaScript = function (buffer, scope) {
      fun.generateJavaScript(buffer, scope);
    
      var args = argsAndOptionalArgs(this.cg, this.functionArguments, this.optionalArguments);
    
      if (this.splattedArguments && this.function.isIndexer) {
        buffer.write('.apply(');
        this.function.object.generateJavaScript(buffer, scope);
        buffer.write(',');
        this.splattedArguments.generateJavaScript(buffer, scope);
        buffer.write(')');
      } else if (this.splattedArguments) {
        buffer.write('.apply(');
        if (this.passThisToApply) {
          buffer.write('this');
        } else {
          buffer.write('null');
        }
        buffer.write(',');
        this.splattedArguments.generateJavaScript(buffer, scope);
        buffer.write(')');
      } else {
        buffer.write('(');
        codegenUtils.writeToBufferWithDelimiter(args, ',', buffer, scope);
        buffer.write(')');
      }
    };
  });
};

exports.optional = function (options, name, defaultValue) {
  return this.oldTerm(function () {
    this.options = options;
    this.name = name;
    this.defaultValue = defaultValue;
  
    this.properDefaultValue = function () {
      if (this.defaultValue === undefined) {
        return this.cg.variable(['undefined']);
      } else {
        return this.defaultValue;
      }
    };

    this.generateJavaScript = function (buffer, scope) {
      buffer.write('(');
      this.options.generateJavaScript(buffer, scope);
      buffer.write('&&');
      this.options.generateJavaScript(buffer, scope);
      buffer.write(".hasOwnProperty('" + this.cg.concatName(this.name) + "')&&");
      this.options.generateJavaScript(buffer, scope);
      buffer.write("." + this.cg.concatName(this.name) + "!==void 0)?");
      this.options.generateJavaScript(buffer, scope);
      buffer.write('.' + this.cg.concatName(this.name) + ':');
      this.properDefaultValue().generateJavaScript(buffer, scope);
    };
  });
};

var argsAndOptionalArgs = function (cg, args, optionalArgs) {
  var a = args.slice();

  if (optionalArgs && optionalArgs.length > 0) {
    a.push(cg.hash(optionalArgs));
  }

  return a;
};

exports.methodCall = function (object, name, args, optionalArgs) {
  var splattedArgs = splattedArguments(this, args, optionalArgs);
  
  if (splattedArgs) {
    var objectVar = this.generatedVariable(['o']);
    return this.statements([
      this.definition(objectVar, object),
      this.methodCall(
        this.fieldReference(objectVar, name),
        ['apply'],
        [objectVar, splattedArgs]
      )
    ], {expression: true});
  } else {
    return this.oldTerm(function () {
      this.isMethodCall = true;
      this.object = object;
      this.name = name;
      this.methodArguments = args;
      this.optionalArguments = optionalArgs;
      
      this.subterms('object', 'methodArguments', 'optionalArguments');

      this.generateJavaScript = function (buffer, scope) {
        this.object.generateJavaScript(buffer, scope);
        buffer.write('.');
        buffer.write(this.cg.concatName(this.name));
        buffer.write('(');
        codegenUtils.writeToBufferWithDelimiter(argsAndOptionalArgs(this.cg, this.methodArguments, this.optionalArguments), ',', buffer, scope);
        buffer.write(')');
      };
    });
  }
};

exports.indexer = function (object, indexer) {
  return this.oldTerm(function () {
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
};

exports.fieldReference = function (object, name) {
  return this.oldTerm(function () {
    this.object = object;
    this.name = name;
    this.isFieldReference = true;
    this.generateJavaScript = function (buffer, scope) {
      this.object.generateJavaScript(buffer, scope);
      buffer.write('.');
      buffer.write(this.cg.concatName(this.name));
    };
    this.generateJavaScriptTarget = this.generateJavaScript;
  });
};

exports.module = function (statements) {
  return this.oldTerm(function () {
    this.statements = statements;
    this.isModule = true;
    this.inScope = true;
    this.global = false;
    this.returnResult = false;
  
    this.generateJavaScript = function (buffer, scope, global) {
      if (this.inScope) {
        var b = this.cg.block([], this.statements, {returnLastStatement: false, redefinesSelf: true});
        this.cg.methodCall(this.cg.subExpression(b), ['call'], [this.cg.variable(['this'])]).generateJavaScript(buffer, new Scope());
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
};

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

exports.definition = function (target, source) {
  return this.oldTerm(function () {
    if (!target) throw Error();
  
    this.isDefinition = true;
    this.target = target;
    this.source = source;

    this.subterms('target', 'source');

    this.expression = function () {
      return this;
    };
  
    this.hashEntry = function () {
      return this.cg.hashEntry(this.target.hashEntryField(), this.source);
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
};

exports.createMacroDirectory = function () {
  var cg = this;
  return new function () {
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
        return cg.functionCall(cg.variable(name), arguments, optionalArguments);
      } else {
        return cg.variable(name);
      }
    };
  };
};

exports.list = function(items) {
  return this.oldTerm(function () {
    this.isList = true;
    this.items = items;
    this.generateJavaScript = function (buffer, scope) {
      buffer.write('[');
      codegenUtils.writeToBufferWithDelimiter(this.items, ',', buffer, scope);
      buffer.write(']');
    };
  });
};

exports.hash = function(entries) {
  return this.oldTerm(function () {
    this.isHash = true;
    this.entries = entries;
  
    this.generateJavaScript = function(buffer, scope) {
      buffer.write('{');
      codegenUtils.writeToBufferWithDelimiter(this.entries, ',', buffer, function (item) {
        item.generateJavaScriptHashEntry(buffer, scope);
      });
      buffer.write('}');
    };
  });
};

var isLegalJavaScriptIdentifier = function(id) {
  return /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(id);
};

exports.hashEntries = function (entries) {
  return _.map(entries, function (entry) {
    return entry.hashEntry();
  });
};

exports.hashEntry = function(field, value) {
  return this.oldTerm(function () {
    this.isHashEntry = true;
    this.field = field;
    this.value = value;
  
    this.subterms('value');

    this.legalFieldName = function () {
      if (this.field.isString) {
        return formatJavaScriptString(this.field.string);
      }
      var f = this.cg.concatName(this.field);
      if (isLegalJavaScriptIdentifier(f)) {
        return f;
      } else {
        return formatJavaScriptString(f);
      }
    }

    this.valueOrTrue = function () {
      if (this.value === undefined) {
        return this.cg.boolean(true);
      } else {
        return this.value;
      }
    };
  
    this.generateJavaScriptHashEntry = function(buffer, scope) {
      var f = this.cg.concatName(this.field);
      buffer.write(this.legalFieldName());
      buffer.write(':');
      this.valueOrTrue().generateJavaScript(buffer, scope);
    };
  });
};

exports.newOperator = function(fn) {
  if (fn.isFunctionCall && fn.hasSplatArguments()) {
    var statements = [];
    fn.passThisToApply = true;
    var constructor = this.block([], this.statements([fn]), {returnLastStatement: false});
    var constructorVariable = this.generatedVariable(['c']);
    statements.push(this.definition(constructorVariable, constructor));
    statements.push(this.definition(this.fieldReference(constructorVariable, ['prototype']), this.fieldReference(fn.function, ['prototype'])));
    statements.push(this.newOperator(constructorVariable));
    return this.statements(statements, {expression: true});
  } else {
    return this.oldTerm(function () {
      this.isNewOperator = true;
      this.functionCall = fn;
      this.generateJavaScript = function(buffer, scope) {
        buffer.write('new ');
        if (this.functionCall.isVariable) {
          this.cg.functionCall(this.functionCall, []).generateJavaScript(buffer, scope);
        } else if (this.functionCall.isFunctionCall && this.functionCall.hasSplatArguments()) {
          this.functionCall.passThisToApply = true;
          this.cg.block([], this.cg.statements([this.functionCall]), {returnLastStatement: false}).generateJavaScript(buffer, scope);
        } else {
          this.functionCall.generateJavaScript(buffer, scope);
        }
      }
    });
  }
};

exports.generatedVariable = function(name) {
  return this.oldTerm(function () {
    this.name = name;
    this.isVariable = true;
    var genVar;
  
    this.generatedName = function(scope) {
      if (!genVar) {
        genVar = scope.generateVariable(this.cg.concatName(this.name));
      }
      return genVar;
    };
  
    this.variableName = function (scope) {
      return this.generatedName(scope);
    };
  
    this.generateJavaScript = function(buffer, scope) {
      buffer.write(this.generatedName(scope));
    };
  
    this.generateJavaScriptParameter = this.generateJavaScript;
  
    this.generateJavaScriptTarget = this.generateJavaScript;
  
    this.definitionName = function(scope) {
      var n = this.cg.concatName([this.generatedName(scope)]);
      if (!scope.isDefined(n)) {
        return n;
      }
    };
  });
};

exports.postIncrement = function(expr) {
  return this.oldTerm(function () {
    this.expression = expr;
    this.generateJavaScript = function(buffer, scope) {
      this.expression.generateJavaScript(buffer, scope);
      buffer.write('++');
    };
  });
};

exports.forEach = function(collection, itemVariable, stmts) {
  var itemsVar = this.generatedVariable(['items']);
  var indexVar = this.generatedVariable(['i']);

  var s = [this.definition(itemVariable, this.indexer(itemsVar, indexVar))];
  s.push.apply(s, stmts.statements);

  var statementsWithItemAssignment = this.statements(s);

  var init = this.definition(indexVar, this.integer(0));
  var test = this.operator('<', [indexVar, this.fieldReference(itemsVar, ['length'])]);
  var incr = this.postIncrement(indexVar);

  return this.statements([
    this.definition(itemsVar, collection),
    this.forStatement(init, test, incr, statementsWithItemAssignment)
  ], {expression: true});
};

exports.forStatement = function(init, test, incr, stmts) {
  return this.oldTerm(function () {
    this.isFor = true;
    this.initialization = init;
    this.test = test;
    this.increment = incr;
    this.statements = stmts;
  
    this.indexVariable = init.target;

    this.scopedBody = function () {
      var loopStatements = [];
      var forResultVariable = this.cg.generatedVariable(['for', 'result']);
      var cg = this.cg;
      var statements = this.statements.clone({rewrite: function (term) {
        if (term.isReturn) {
          return cg.statements([cg.definition(forResultVariable, term.expression), cg.returnStatement(cg.boolean(true))], {expression: true});
        }
      }});
      loopStatements.push(this.cg.definition(forResultVariable, this.cg.nil()));
      loopStatements.push(this.cg.ifExpression([[this.cg.subExpression(this.cg.functionCall(this.cg.block([this.indexVariable], statements, {returnLastStatement: false}), [this.indexVariable])), this.cg.statements([this.cg.returnStatement(forResultVariable)])]]));
      return this.cg.statements(loopStatements);
    };
  
    this.generateJavaScript = function(buffer, scope) {
      buffer.write('for(');
      this.initialization.generateJavaScript(buffer, scope);
      buffer.write(';');
      this.test.generateJavaScript(buffer, scope);
      buffer.write(';');
      this.increment.generateJavaScript(buffer, scope);
      buffer.write('){');
      this.scopedBody().generateJavaScriptStatements(buffer, scope);
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
};

exports.forIn = function(iterator, collection, stmts) {
  return this.oldTerm(function () {
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
      this.cg.subExpression(this.cg.functionCall(this.cg.block([this.iterator], this.statements, {returnLastStatement: false}), [this.iterator])).generateJavaScriptStatement(buffer, scope);
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
};

exports.whileStatement = function(test, statements) {
  return this.oldTerm(function () {
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
};

exports.scope = function (stmts, options) {
  return this.oldTerm(function () {
    this.isScope = true;
    this.statements = stmts;
    this.alwaysGenerateFunction = options != null? options.alwaysGenerateFunction: undefined;
    
    this.subterms('statements');
    
    this.generateJavaScript = function (buffer, scope) {
      if (this.statements.length === 1 && !this.alwaysGenerateFunction) {
        this.statements[0].generateJavaScript(buffer, scope);
      } else {
        this.cg.functionCall(this.cg.subExpression(this.cg.block([], this.cg.statements(this.statements))), []).generateJavaScript(buffer, scope);
      }
    };
  });
}

exports.subExpression = function (expression) {
  return this.oldTerm(function () {
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

exports.argumentList = function (args) {
  return this.oldTerm(function () {
    this.isArgumentList = true;
    this.args = args;

    this.subterms('args');
    
    this.arguments = function () {
      return this.args;
    };
  });
};

exports.tryStatement = function (body, catchBody, finallyBody) {
  return this.oldTerm(function () {
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
      this.cg.scope([this], {alwaysGenerateFunction: true}).generateJavaScript(buffer, symbolScope);
    };
  });
};

exports.operator = function (op, args) {
  return this.oldTerm(function () {
    this.isOperator = true;
    this.operator = op;
    this.operatorArguments = args;

    this.isOperatorAlpha = function () {
      return /[a-zA-Z]+/.test(this.operator);
    };

    this.generateJavaScript = function(buffer, scope) {
      buffer.write('(');
    
      if (this.operatorArguments.length === 1) {
        buffer.write(op);
        if (this.isOperatorAlpha()) {
          buffer.write(' ');
        }
        this.operatorArguments[0].generateJavaScript(buffer, scope);
      } else {
        var alpha = this.isOperatorAlpha();
      
        this.operatorArguments[0].generateJavaScript(buffer, scope);
        for(var n = 1; n < this.operatorArguments.length; n++) {
          if (alpha) {
            buffer.write(' ');
          }
          buffer.write(op);
          if (alpha) {
            buffer.write(' ');
          }
          this.operatorArguments[n].generateJavaScript(buffer, scope);
        }
      }
    
      buffer.write(')');
    };
  });
};

exports.returnStatement = function(expr) {
  return this.oldTerm(function () {
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
};

exports.throwStatement = function(expr) {
  return this.oldTerm(function () {
    this.isThrow = true;
    this.expression = expr;
    this.generateJavaScriptStatement = function(buffer, scope) {
      buffer.write('throw ');
      this.expression.generateJavaScript(buffer, scope);
      buffer.write(';');
    };
    this.generateJavaScriptReturn = this.generateJavaScriptStatement;
  });
};

exports.breakStatement = function () {
  return this.oldTerm(function () {
    this.isBreak = true;
    this.generateJavaScriptStatement = function (buffer, scope) {
      buffer.write('break;');
    };
    this.generateJavaScriptReturn = this.generateJavaScriptStatement;
  });
};

exports.continueStatement = function () {
  return this.oldTerm(function () {
    this.isContinue = true;
    this.generateJavaScriptStatement = function (buffer, scope) {
      buffer.write('continue;');
    };
    this.generateJavaScriptReturn = this.generateJavaScriptStatement;
  });
};

exports.splat = function () {
  return this.oldTerm(function () {
    this.isSplat = true;
    
    this.parameter = function () {
      return this;
    };
  });
};
