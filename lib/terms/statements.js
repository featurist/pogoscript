(function() {
    var self = this;
    var _, codegenUtils, statementsUtils;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    statementsUtils = require("./statementsUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(statements, gen1_options) {
                var self = this;
                var async;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                self.isStatements = true;
                self.statements = statements;
                return self.isAsync = async;
            },
            generateStatements: function(scope, gen2_options) {
                var self = this;
                var inClosure, global;
                inClosure = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "inClosure") && gen2_options.inClosure !== void 0 ? gen2_options.inClosure : false;
                global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
                return self.generateIntoBuffer(function(buffer) {
                    var definedVariables, s, statement;
                    if (inClosure) {
                        definedVariables = self.findDefinedVariables(scope);
                        self.generateVariableDeclarations(definedVariables, buffer, scope, {
                            global: global
                        });
                    }
                    for (s = 0; s < self.statements.length; ++s) {
                        statement = self.statements[s];
                        buffer.write(statement.generateStatement(scope));
                    }
                    return void 0;
                });
            },
            rewriteResultTermInto: function(returnTerm, gen3_options) {
                var self = this;
                var async;
                async = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "async") && gen3_options.async !== void 0 ? gen3_options.async : false;
                var lastStatement, rewrittenLastStatement;
                if (self.statements.length > 0) {
                    lastStatement = self.statements[self.statements.length - 1];
                    rewrittenLastStatement = lastStatement.rewriteResultTermInto(function(term) {
                        return returnTerm(term);
                    }, {
                        async: async
                    });
                    if (rewrittenLastStatement) {
                        return self.statements[self.statements.length - 1] = rewrittenLastStatement;
                    } else {
                        return self.statements.push(returnTerm(terms.nil()));
                    }
                } else if (async) {
                    return self.statements.push(terms.functionCall(terms.callbackFunction, []));
                }
            },
            rewriteLastStatementToReturn: function(gen4_options) {
                var self = this;
                var async, returnCallToContinuation;
                async = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "async") && gen4_options.async !== void 0 ? gen4_options.async : false;
                returnCallToContinuation = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "returnCallToContinuation") && gen4_options.returnCallToContinuation !== void 0 ? gen4_options.returnCallToContinuation : true;
                var containsContinuation;
                containsContinuation = self.containsContinuation();
                return self.rewriteResultTermInto(function(term) {
                    var callToContinuation;
                    if (async && !containsContinuation) {
                        callToContinuation = terms.functionCall(terms.callbackFunction, [ terms.nil(), term ]);
                        if (returnCallToContinuation) {
                            return terms.returnStatement(callToContinuation, {
                                implicit: true
                            });
                        } else {
                            return callToContinuation;
                        }
                    } else {
                        return terms.returnStatement(term, {
                            implicit: true
                        });
                    }
                }, {
                    async: async
                });
            },
            generateVariableDeclarations: function(variables, buffer, scope, gen5_options) {
                var self = this;
                var global;
                global = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "global") && gen5_options.global !== void 0 ? gen5_options.global : false;
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
            findDefinedVariables: function(scope) {
                var self = this;
                var variables;
                variables = codegenUtils.definedVariables(scope);
                self.walkDescendantsNotBelowIf(function(subterm, path) {
                    return subterm.defineVariables(variables, scope);
                }, function(subterm, path) {
                    return subterm.isClosure;
                });
                return variables.uniqueVariables();
            },
            blockify: function(parameters, options) {
                var self = this;
                var statements;
                statements = function() {
                    if (self.isExpressionStatements) {
                        return self.cg.statements([ self ]);
                    } else {
                        return self;
                    }
                }();
                return terms.block(parameters, statements, options);
            },
            scopify: function() {
                var self = this;
                return self.cg.functionCall(self.cg.block([], self), []);
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return self.codeIntoBuffer(buffer, function(buffer) {
                    if (self.statements.length > 0) {
                        return buffer.write(self.statements[self.statements.length - 1].generate(scope));
                    }
                });
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                return self.codeIntoBuffer(buffer, function(buffer) {
                    if (self.statements.length > 0) {
                        return buffer.write(self.statements[self.statements.length - 1].generateStatement(scope));
                    }
                });
            },
            definitions: function(scope) {
                var self = this;
                return _(self.statements).reduce(function(list, statement) {
                    var defs;
                    defs = statement.definitions(scope);
                    return list.concat(defs);
                }, []);
            },
            serialiseStatements: function() {
                var self = this;
                self.statements = statementsUtils.serialiseStatements(self.statements);
                return void 0;
            },
            asyncify: function(gen6_options) {
                var self = this;
                var returnCallToContinuation;
                returnCallToContinuation = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "returnCallToContinuation") && gen6_options.returnCallToContinuation !== void 0 ? gen6_options.returnCallToContinuation : true;
                if (!self.isAsync) {
                    self.rewriteLastStatementToReturn({
                        async: true,
                        returnCallToContinuation: returnCallToContinuation
                    });
                    return self.isAsync = true;
                }
            }
        });
    };
}).call(this);