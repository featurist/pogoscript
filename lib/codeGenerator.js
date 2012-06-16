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
