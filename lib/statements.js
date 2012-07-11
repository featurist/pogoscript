((function() {
    var self, _, codegenUtils;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(statements, gen1_options) {
                var expression, self;
                expression = gen1_options && gen1_options.hasOwnProperty("expression") && gen1_options.expression !== void 0 ? gen1_options.expression : false;
                self = this;
                self.isStatements = true;
                self.statements = statements;
                return self.isExpressionStatements = expression;
            },
            generateStatements: function(statements, buffer, scope, global, generateReturn) {
                var self, declaredVariables, s, statement;
                self = this;
                declaredVariables = self.findDeclaredVariables(scope);
                self.generateVariableDeclarations(declaredVariables, buffer, scope, global);
                for (s = 0; s < statements.length; s = s + 1) {
                    statement = statements[s];
                    if (s === statements.length - 1 && generateReturn) {
                        statement.generateJavaScriptReturn(buffer, scope);
                    } else {
                        statement.generateJavaScriptStatement(buffer, scope);
                    }
                }
            },
            rewriteAsyncCallbacks: function(gen2_options) {
                var returnLastStatement, callbackFunction, self, returnTerm, statements, n, gen3_forResult;
                returnLastStatement = gen2_options && gen2_options.hasOwnProperty("returnLastStatement") && gen2_options.returnLastStatement !== void 0 ? gen2_options.returnLastStatement : false;
                callbackFunction = gen2_options && gen2_options.hasOwnProperty("callbackFunction") && gen2_options.callbackFunction !== void 0 ? gen2_options.callbackFunction : void 0;
                self = this;
                returnTerm = function(term) {
                    if (returnLastStatement) {
                        return terms.returnStatement(term);
                    } else if (callbackFunction) {
                        return terms.functionCall(callbackFunction, [ terms.nil(), term ]);
                    } else {
                        return term;
                    }
                };
                statements = self._serialiseStatements(self.statements, returnTerm);
                for (n = 0; n < statements.length; n = n + 1) {
                    gen3_forResult = void 0;
                    if (function(n) {
                        var statement, asyncStatement, firstStatements;
                        statement = statements[n];
                        asyncStatement = statement.makeAsyncWithStatements(function() {
                            return statements.slice(n + 1);
                        });
                        if (asyncStatement) {
                            firstStatements = statements.slice(0, n);
                            firstStatements.push(asyncStatement);
                            gen3_forResult = terms.statements(firstStatements);
                            return true;
                        }
                    }(n)) {
                        return gen3_forResult;
                    }
                }
                return terms.statements(statements);
            },
            _serialiseStatements: function(statements, returnTerm) {
                var self, serialisedStatements, n, statement, rewrittenStatement;
                self = this;
                serialisedStatements = [];
                for (n = 0; n < statements.length; n = n + 1) {
                    statement = statements[n];
                    rewrittenStatement = statement.clone({
                        rewrite: function(term) {
                            return term.serialiseSubStatements(serialisedStatements);
                        },
                        limit: function(term) {
                            return term.isStatements && !term.isExpressionStatements;
                        }
                    });
                    if (n === statements.length - 1) {
                        serialisedStatements.push(rewrittenStatement.returnResult(returnTerm));
                    } else {
                        serialisedStatements.push(rewrittenStatement);
                    }
                }
                return serialisedStatements;
            },
            serialiseSubStatements: function(statements) {
                var self, firstStatements, gen4_o;
                self = this;
                if (self.isExpressionStatements) {
                    firstStatements = self.statements.slice(0, self.statements.length - 1);
                    gen4_o = statements;
                    gen4_o.push.apply(gen4_o, firstStatements);
                    return self.statements[self.statements.length - 1];
                }
            },
            generateVariableDeclarations: function(variables, buffer, scope, global) {
                var self;
                self = this;
                if (variables.length > 0) {
                    _(variables).each(function(name) {
                        return scope.define(name);
                    });
                    if (!global) {
                        buffer.write("var ");
                        codegenUtils.writeToBufferWithDelimiter(variables, ",", buffer, function(variable) {
                            return buffer.write(variable);
                        });
                        return buffer.write(";");
                    }
                }
            },
            findDeclaredVariables: function(scope) {
                var self, declaredVariables;
                self = this;
                declaredVariables = [];
                self.walkDescendantsNotBelowIf(function(subterm) {
                    return subterm.declareVariables(declaredVariables, scope);
                }, function(subterm, path) {
                    return subterm.isStatements && path[path.length - 1].isClosure;
                });
                return _.uniq(declaredVariables);
            },
            generateJavaScriptStatements: function(buffer, scope, global) {
                var self;
                self = this;
                return self.generateStatements(self.statements, buffer, scope, global);
            },
            blockify: function(parameters, optionalParameters, gen5_options) {
                var async, self, statements, b;
                async = gen5_options && gen5_options.hasOwnProperty("async") && gen5_options.async !== void 0 ? gen5_options.async : false;
                self = this;
                statements = function() {
                    if (self.isExpressionStatements) {
                        return self.cg.statements([ self ]);
                    } else {
                        return self;
                    }
                }();
                b = self.cg.block(parameters, statements, {
                    async: async
                });
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
                    return self.generateStatements(self.statements, buffer, scope, global, true);
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
    };
})).call(this);