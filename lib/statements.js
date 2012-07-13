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
                var returnLastStatement, callbackFunction, self, returnTerm, statements, n, gen3_forResult;
                returnLastStatement = gen2_options && gen2_options.hasOwnProperty("returnLastStatement") && gen2_options.returnLastStatement !== void 0 ? gen2_options.returnLastStatement : false;
                callbackFunction = gen2_options && gen2_options.hasOwnProperty("callbackFunction") && gen2_options.callbackFunction !== void 0 ? gen2_options.callbackFunction : void 0;
                self = this;
                returnTerm = function(term) {
                    if (returnLastStatement) {
                        return terms.returnStatement(term, {
                            implicit: true
                        });
                    } else if (callbackFunction) {
                        return terms.functionCall(callbackFunction, [ terms.nil(), term ]);
                    } else {
                        return term;
                    }
                };
                statements = self.serialiseStatements(self.statements, returnTerm);
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
                return terms.statements(statements, {
                    global: self.global
                });
            },
            serialiseStatements: function(statements, returnTerm) {
                var self, serialisedStatements, n, statement, rewrittenStatement;
                self = this;
                serialisedStatements = [];
                for (n = 0; n < statements.length; n = n + 1) {
                    statement = statements[n];
                    rewrittenStatement = statement.clone({
                        rewrite: function(term, gen4_options) {
                            var clone;
                            clone = gen4_options && gen4_options.hasOwnProperty("clone") && gen4_options.clone !== void 0 ? gen4_options.clone : void 0;
                            return term.serialiseSubStatements(serialisedStatements, clone);
                        },
                        limit: function(term) {
                            return term.isClosure;
                        }
                    });
                    serialisedStatements.push(rewrittenStatement);
                }
                if (returnTerm) {
                    serialisedStatements[serialisedStatements.length - 1] = serialisedStatements[serialisedStatements.length - 1].returnResult(returnTerm);
                }
                return serialisedStatements;
            },
            returnLastStatement: function(returnTerm) {
                var self;
                self = this;
                return self.statements[self.statements.length - 1] = self.statements[self.statements.length - 1].returnResult(returnTerm);
            },
            serialiseSubStatements: function(serialisedStatements, clone) {
                var self;
                self = this;
                return terms.statements(self.serialiseStatements(self.statements));
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