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
                var global, self;
                global = gen1_options && gen1_options.hasOwnProperty("global") && gen1_options.global !== void 0 ? gen1_options.global : false;
                self = this;
                self.isStatements = true;
                self.statements = statements;
                return self.global = global;
            },
            generateStatements: function(statements, buffer, scope) {
                var self, declaredVariables, s, statement;
                self = this;
                declaredVariables = self.findDeclaredVariables(scope);
                self.generateVariableDeclarations(declaredVariables, buffer, scope);
                for (s = 0; s < statements.length; s = s + 1) {
                    statement = statements[s];
                    statement.generateJavaScriptStatement(buffer, scope);
                }
            },
            rewriteAsyncCallbacks: function(gen2_options) {
                var returnLastStatement, forceAsync, self, statements, madeStatementsReturn, callbackFunction, statementsWithReturn, n, gen3_forResult;
                returnLastStatement = gen2_options && gen2_options.hasOwnProperty("returnLastStatement") && gen2_options.returnLastStatement !== void 0 ? gen2_options.returnLastStatement : false;
                forceAsync = gen2_options && gen2_options.hasOwnProperty("forceAsync") && gen2_options.forceAsync !== void 0 ? gen2_options.forceAsync : false;
                self = this;
                statements = self._serialiseStatements(self.statements);
                madeStatementsReturn = false;
                callbackFunction = void 0;
                statementsWithReturn = function(gen4_options) {
                    var async, returnTerm;
                    async = gen4_options && gen4_options.hasOwnProperty("async") && gen4_options.async !== void 0 ? gen4_options.async : false;
                    if (!madeStatementsReturn) {
                        if (async) {
                            callbackFunction = terms.generatedVariable([ "callback" ]);
                        }
                        returnTerm = function(term) {
                            if (returnLastStatement && async) {
                                return terms.functionCall(callbackFunction, [ terms.nil(), term ]);
                            } else if (returnLastStatement) {
                                return terms.returnStatement(term, {
                                    implicit: true
                                });
                            } else {
                                return term;
                            }
                        };
                        if (statements.length > 0) {
                            statements[statements.length - 1] = statements[statements.length - 1].returnResult(returnTerm);
                        }
                        madeStatementsReturn = true;
                    }
                    return statements;
                };
                for (n = 0; n < statements.length; n = n + 1) {
                    gen3_forResult = void 0;
                    if (function(n) {
                        var statement, asyncStatement, firstStatements;
                        statement = statements[n];
                        asyncStatement = statement.makeAsyncWithStatements(function(errorVariable) {
                            var callbackStatements, catchErrorVariable;
                            callbackStatements = statementsWithReturn({
                                async: true
                            }).slice(n + 1);
                            catchErrorVariable = terms.generatedVariable([ "error" ]);
                            return [ terms.ifExpression([ [ errorVariable, terms.statements([ terms.functionCall(callbackFunction, [ errorVariable ]) ]) ] ], terms.statements([ terms.tryExpression(terms.statements(callbackStatements), {
                                catchParameter: catchErrorVariable,
                                catchBody: terms.statements([ terms.functionCall(callbackFunction, [ catchErrorVariable ]) ])
                            }) ])) ];
                        });
                        if (asyncStatement) {
                            firstStatements = statements.slice(0, n);
                            firstStatements.push(asyncStatement);
                            gen3_forResult = {
                                statements: terms.statements(firstStatements),
                                callbackFunction: callbackFunction
                            };
                            return true;
                        }
                    }(n)) {
                        return gen3_forResult;
                    }
                }
                return {
                    statements: terms.statements(statementsWithReturn({
                        async: forceAsync
                    }), {
                        global: self.global
                    }),
                    callbackFunction: callbackFunction
                };
            },
            _serialiseStatements: function(statements) {
                var self, serialisedStatements, n, statement, rewrittenStatement;
                self = this;
                serialisedStatements = [];
                for (n = 0; n < statements.length; n = n + 1) {
                    statement = statements[n];
                    rewrittenStatement = statement.clone({
                        rewrite: function(term, gen5_options) {
                            var clone, path;
                            clone = gen5_options && gen5_options.hasOwnProperty("clone") && gen5_options.clone !== void 0 ? gen5_options.clone : void 0;
                            path = gen5_options && gen5_options.hasOwnProperty("path") && gen5_options.path !== void 0 ? gen5_options.path : void 0;
                            return term.serialiseSubStatements(serialisedStatements, clone, path.length === 1);
                        },
                        limit: function(term) {
                            return term.isClosure;
                        }
                    });
                    serialisedStatements.push(rewrittenStatement);
                }
                return serialisedStatements;
            },
            returnLastStatement: function(returnTerm) {
                var self;
                self = this;
                if (self.statements.length > 0) {
                    return self.statements[self.statements.length - 1] = self.statements[self.statements.length - 1].returnResult(returnTerm);
                }
            },
            serialiseSubStatements: function(serialisedStatements, clone) {
                var self;
                self = this;
                return terms.statements(self._serialiseStatements(self.statements));
            },
            generateVariableDeclarations: function(variables, buffer, scope) {
                var self;
                self = this;
                if (variables.length > 0) {
                    _(variables).each(function(name) {
                        return scope.define(name);
                    });
                    if (!self.global) {
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
            generateJavaScriptStatements: function(buffer, scope) {
                var self;
                self = this;
                return self.generateStatements(self.statements, buffer, scope);
            },
            blockify: function(parameters, optionalParameters, gen6_options) {
                var async, self, statements, b;
                async = gen6_options && gen6_options.hasOwnProperty("async") && gen6_options.async !== void 0 ? gen6_options.async : false;
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