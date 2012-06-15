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
        return codegenUtils.formatJavaScriptString(this.field.string);
      }
      var f = codegenUtils.concatName(this.field);
      if (isLegalJavaScriptIdentifier(f)) {
        return f;
      } else {
        return codegenUtils.formatJavaScriptString(f);
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
      var f = codegenUtils.concatName(this.field);
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
        genVar = scope.generateVariable(codegenUtils.concatName(this.name));
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
      var n = codegenUtils.concatName([this.generatedName(scope)]);
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
      var self = this;
      var loopStatements = [];
      var forResultVariable = this.cg.generatedVariable(['for', 'result']);
      var cg = this.cg;
      var statements = this.statements.clone({
        rewrite: function (term) {
          if (term.isReturn) {
            return cg.statements([cg.definition(forResultVariable, term.expression), cg.returnStatement(cg.boolean(true))], {expression: true});
          }
        },
        limit: function (term, path) {
          if (term.isStatements) {
            if (path.length > 0) {
              return path[path.length - 1].isClosure;
            }
          }
        }
      });
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
        this.finallyBody.generateJavaScriptStatements(buffer, scope);
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
