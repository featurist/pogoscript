var _ = require('underscore');
var codegenUtils = require('./codegenUtils');

var hasScope = function (s) {
  if (!s) {
    console.log('---------------- NO SCOPE! -----------------');
    throw new Error('no scope');
  }
};

exports.statements = function (statements, options) {
  return this.term(function () {
    this.isStatements = true;
    this.statements = statements;
    this.isExpressionStatements = options && options.hasOwnProperty('expression') && options.expression !== void 0? options.expression: false;
    
    this.subterms('statements');

    this.generateStatements = function (statements, buffer, scope, global) {
      var self = this;
      
      hasScope(scope);

      var namesDefined = _(this.statements).chain().reduce(function (list, statement) {
        var defs = statement.definitions(scope);
        return list.concat(defs);
      }, []).uniq().value();

      if (namesDefined.length > 0) {
        _(namesDefined).each(function (name) {
          scope.define(name);
        });

        if (!global) {
          buffer.write ('var ');
          codegenUtils.writeToBufferWithDelimiter(namesDefined, ',', buffer, function (item) {
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
      var b = this.cg.block(parameters, this);
      b.optionalParameters = optionalParameters;
      return b;
    };

    this.scopify = function () {
      return this.cg.functionCall(this.cg.block([], this), []);
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
