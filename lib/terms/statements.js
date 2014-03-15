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
                var async, globalDefinitions;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                globalDefinitions = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "globalDefinitions") && gen1_options.globalDefinitions !== void 0 ? gen1_options.globalDefinitions : globalDefinitions;
                self.isStatements = true;
                self.statements = statements;
                self.isAsync = async;
                return self.makeDefinitionsGlobal = function() {
                    var self = this;
                    var gen2_items, gen3_i, definition;
                    if (globalDefinitions) {
                        gen2_items = globalDefinitions;
                        for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                            definition = gen2_items[gen3_i];
                            definition.global = true;
                        }
                        return void 0;
                    }
                };
            },
            generateStatements: function(statements, buffer, scope, gen4_options) {
                var self = this;
                var inClosure, global;
                inClosure = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "inClosure") && gen4_options.inClosure !== void 0 ? gen4_options.inClosure : false;
                global = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "global") && gen4_options.global !== void 0 ? gen4_options.global : false;
                var definedVariables, s, statement;
                if (inClosure) {
                    definedVariables = self.findDefinedVariables(scope);
                    self.generateVariableDeclarations(definedVariables, buffer, scope, {
                        global: global
                    });
                }
                for (s = 0; s < statements.length; ++s) {
                    statement = statements[s];
                    statement.generateJavaScriptStatement(buffer, scope);
                }
                return void 0;
            },
            rewriteResultTermInto: function(returnTerm, gen5_options) {
                var self = this;
                var async;
                async = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "async") && gen5_options.async !== void 0 ? gen5_options.async : false;
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
            rewriteLastStatementToReturn: function(gen6_options) {
                var self = this;
                var async, returnCallToContinuation;
                async = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "async") && gen6_options.async !== void 0 ? gen6_options.async : false;
                returnCallToContinuation = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "returnCallToContinuation") && gen6_options.returnCallToContinuation !== void 0 ? gen6_options.returnCallToContinuation : true;
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
            generateVariableDeclarations: function(variables, buffer, scope, gen7_options) {
                var self = this;
                var global;
                global = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "global") && gen7_options.global !== void 0 ? gen7_options.global : false;
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
            generateJavaScriptStatements: function(buffer, scope, gen8_options) {
                var self = this;
                var inClosure, global;
                inClosure = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "inClosure") && gen8_options.inClosure !== void 0 ? gen8_options.inClosure : false;
                global = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "global") && gen8_options.global !== void 0 ? gen8_options.global : false;
                return self.generateStatements(self.statements, buffer, scope, {
                    inClosure: inClosure,
                    global: global
                });
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
                if (self.statements.length > 0) {
                    return self.statements[self.statements.length - 1].generateJavaScript(buffer, scope);
                }
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                if (self.statements.length > 0) {
                    return self.statements[self.statements.length - 1].generateJavaScriptStatement(buffer, scope);
                }
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
            asyncify: function(gen9_options) {
                var self = this;
                var returnCallToContinuation;
                returnCallToContinuation = gen9_options !== void 0 && Object.prototype.hasOwnProperty.call(gen9_options, "returnCallToContinuation") && gen9_options.returnCallToContinuation !== void 0 ? gen9_options.returnCallToContinuation : true;
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