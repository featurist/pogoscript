((function() {
    var self, _, codegenUtils, hasScope;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    hasScope = function(s) {
        if (!s) {
            console.log("---------------- NO SCOPE! -----------------");
            throw new Error("no scope");
        }
    };
    module.exports = function(cg) {
        var self, statementsTerm, statements;
        self = this;
        statementsTerm = classExtending(cg.termClass, {
            constructor: function(statements, gen1_options) {
                var expression, self;
                expression = gen1_options && gen1_options.hasOwnProperty("expression") && gen1_options.expression !== void 0 ? gen1_options.expression : false;
                self = this;
                self.isStatements = true;
                self.statements = statements;
                return self.isExpressionStatements = expression;
            },
            generateStatements: function(statements, buffer, scope, global) {
                var self, namesDefined;
                self = this;
                hasScope(scope);
                namesDefined = _(self.statements).chain().reduce(function(list, statement) {
                    var defs;
                    defs = statement.definitions(scope);
                    return list.concat(defs);
                }, []).uniq().value();
                if (namesDefined.length > 0) {
                    _(namesDefined).each(function(name) {
                        return scope.define(name);
                    });
                    if (!global) {
                        buffer.write("var ");
                        codegenUtils.writeToBufferWithDelimiter(namesDefined, ",", buffer, function(item) {
                            return buffer.write(item);
                        });
                        buffer.write(";");
                    }
                }
                return _(statements).each(function(statement) {
                    self.writeSubStatementsForAllSubTerms(statement, buffer, scope);
                    return statement.generateJavaScriptStatement(buffer, scope);
                });
            },
            writeSubStatements: function(subterm, buffer, scope) {
                var self;
                self = this;
                if (subterm.isExpressionStatements) {
                    statements = subterm;
                    if (statements.statements.length > 0) {
                        return statements.generateStatements(statements.statements.slice(0, statements.statements.length - 1), buffer, scope);
                    }
                }
            },
            writeSubStatementsForAllSubTerms: function(statement, buffer, scope) {
                var self;
                self = this;
                self.writeSubStatements(statement, buffer, scope);
                return statement.walkDescendantsNotBelowIf(function(subterm) {
                    return self.writeSubStatements(subterm, buffer, scope);
                }, function(subterm) {
                    return subterm.isStatements && !subterm.isExpressionStatements;
                });
            },
            generateJavaScriptStatements: function(buffer, scope, global) {
                var self;
                self = this;
                return self.generateStatements(self.statements, buffer, scope, global);
            },
            blockify: function(parameters, optionalParameters) {
                var self, b;
                self = this;
                b = self.cg.block(parameters, self);
                b.optionalParameters = optionalParameters;
                return b;
            },
            scopify: function() {
                var self;
                self = this;
                return self.cg.functionCall(self.cg.block([], self), []);
            },
            generateJavaScriptStatementsReturn: function(buffer, scope, global) {
                var self;
                self = this;
                if (self.statements.length > 0) {
                    var returnStatement;
                    self.generateStatements(self.statements.slice(0, self.statements.length - 1), buffer, scope, global);
                    returnStatement = self.statements[self.statements.length - 1];
                    self.writeSubStatementsForAllSubTerms(returnStatement, buffer, scope);
                    return returnStatement.generateJavaScriptReturn(buffer, scope);
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                if (self.statements.length > 0) {
                    return self.statements[self.statements.length - 1].generateJavaScript(buffer, scope);
                }
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self;
                self = this;
                if (self.statements.length > 0) {
                    return self.statements[self.statements.length - 1].generateJavaScriptStatement(buffer, scope);
                }
            },
            generateJavaScriptReturn: function(buffer, scope) {
                var self;
                self = this;
                if (self.statements.length > 0) {
                    return self.statements[self.statements.length - 1].generateJavaScriptReturn(buffer, scope);
                }
            },
            definitions: function(scope) {
                var self;
                self = this;
                return _(self.statements).reduce(function(list, statement) {
                    var defs;
                    defs = statement.definitions(scope);
                    return list.concat(defs);
                }, []);
            }
        });
        return statements = function(statements, gen2_options) {
            var expression;
            expression = gen2_options && gen2_options.hasOwnProperty("expression") && gen2_options.expression !== void 0 ? gen2_options.expression : false;
            return new statementsTerm(statements, {
                expression: expression
            });
        };
    };
})).call(this);