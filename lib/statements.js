((function() {
    var self, _, codegenUtils, statementsUtils;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    statementsUtils = require("./statementsUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(statements, gen1_options) {
                var global, async, self;
                global = gen1_options && gen1_options.hasOwnProperty("global") && gen1_options.global !== void 0 ? gen1_options.global : false;
                async = gen1_options && gen1_options.hasOwnProperty("async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                self = this;
                self.isStatements = true;
                self.statements = statements;
                self.global = global;
                return self.isAsync = async;
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
            rewriteResultTermInto: function(returnTerm) {
                var self;
                self = this;
                if (self.statements.length > 0) {
                    return self.statements[self.statements.length - 1] = self.statements[self.statements.length - 1].rewriteResultTermInto(function(term) {
                        return returnTerm(term);
                    });
                }
            },
            rewriteLastStatementToReturn: function(gen2_options) {
                var async, self;
                async = gen2_options && gen2_options.hasOwnProperty("async") && gen2_options.async !== void 0 ? gen2_options.async : false;
                self = this;
                return self.rewriteResultTermInto(function(term) {
                    if (async) {
                        return terms.functionCall(terms.callbackFunction, [ terms.nil(), term ]);
                    } else {
                        return terms.returnStatement(term, {
                            implicit: true
                        });
                    }
                });
            },
            rewriteLastStatementToNotReturn: function() {
                var self;
                self = this;
                return self.rewriteResultTermInto(function(term) {
                    if (term.isReturn && term.isImplicit) {
                        return term.expression;
                    }
                });
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
            blockify: function(parameters, gen3_options) {
                var optionalParameters, async, self, statements;
                optionalParameters = gen3_options && gen3_options.hasOwnProperty("optionalParameters") && gen3_options.optionalParameters !== void 0 ? gen3_options.optionalParameters : void 0;
                async = gen3_options && gen3_options.hasOwnProperty("async") && gen3_options.async !== void 0 ? gen3_options.async : false;
                self = this;
                statements = function() {
                    if (self.isExpressionStatements) {
                        return self.cg.statements([ self ]);
                    } else {
                        return self;
                    }
                }();
                return terms.block(parameters, statements, {
                    optionalParameters: optionalParameters,
                    async: async
                });
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
            },
            serialiseStatements: function() {
                var self;
                self = this;
                self.statements = statementsUtils.serialiseStatements(self.statements);
                return void 0;
            },
            asyncify: function() {
                var self;
                self = this;
                if (!self.isAsync) {
                    self.rewriteLastStatementToReturn({
                        async: true
                    });
                    return self.isAsync = true;
                }
            }
        });
    };
})).call(this);