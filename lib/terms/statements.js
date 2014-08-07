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
                var async, definitions, returnsPromise;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                definitions = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "definitions") && gen1_options.definitions !== void 0 ? gen1_options.definitions : definitions;
                returnsPromise = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnsPromise") && gen1_options.returnsPromise !== void 0 ? gen1_options.returnsPromise : false;
                self.isStatements = true;
                self.statements = statements;
                self.isAsync = async;
                self.returnsPromise = returnsPromise;
                return self._definitions = definitions;
            },
            generateStatements: function(scope, gen2_options) {
                var self = this;
                var isScope, global;
                isScope = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "isScope") && gen2_options.isScope !== void 0 ? gen2_options.isScope : false;
                global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
                return self.generateIntoBuffer(function(buffer) {
                    var definedVariables, s, statement;
                    if (isScope) {
                        definedVariables = self.findDefinedVariables(scope);
                        self.generateVariableDeclarations(definedVariables, buffer, {
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
            promisify: function(gen3_options) {
                var self = this;
                var definitions, statements;
                definitions = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "definitions") && gen3_options.definitions !== void 0 ? gen3_options.definitions : void 0;
                statements = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "statements") && gen3_options.statements !== void 0 ? gen3_options.statements : false;
                var newPromise;
                if (!self.returnsPromise) {
                    newPromise = terms.newPromise({
                        statements: self
                    });
                    if (statements) {
                        return terms.statements([ terms.newPromise({
                            statements: self
                        }) ], {
                            returnsPromise: true,
                            definitions: definitions
                        });
                    } else {
                        if (self.statements.length === 1) {
                            return self.statements[0].promisify();
                        } else {
                            return terms.newPromise({
                                statements: self
                            });
                        }
                    }
                } else {
                    if (statements) {
                        return self;
                    } else {
                        return self.statements[0];
                    }
                }
            },
            rewriteResultTermInto: function(returnTerm, gen4_options) {
                var self = this;
                var async;
                async = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "async") && gen4_options.async !== void 0 ? gen4_options.async : false;
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
                    return self.statements.push(terms.functionCall(terms.onFulfilledFunction, []));
                }
            },
            rewriteLastStatementToReturn: function(gen5_options) {
                var self = this;
                var async;
                async = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "async") && gen5_options.async !== void 0 ? gen5_options.async : false;
                var containsContinuation;
                containsContinuation = self.containsContinuation();
                return self.rewriteResultTermInto(function(term) {
                    if (async) {
                        return terms.functionCall(terms.onFulfilledFunction, [ term ]);
                    } else {
                        return terms.returnStatement(term, {
                            implicit: true
                        });
                    }
                });
            },
            generateVariableDeclarations: function(variables, buffer, gen6_options) {
                var self = this;
                var global;
                global = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "global") && gen6_options.global !== void 0 ? gen6_options.global : false;
                if (variables.length > 0) {
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
                var definitions, variables, gen7_items, gen8_i, def;
                definitions = self._definitions || self.definitions();
                variables = codegenUtils.definedVariables(scope);
                gen7_items = definitions;
                for (gen8_i = 0; gen8_i < gen7_items.length; ++gen8_i) {
                    def = gen7_items[gen8_i];
                    def.defineVariables(variables);
                }
                return variables.names();
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
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    if (self.statements.length > 0) {
                        return buffer.write(self.statements[self.statements.length - 1].generate(scope));
                    }
                });
            },
            generateStatement: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    if (self.statements.length > 0) {
                        return buffer.write(self.statements[self.statements.length - 1].generateStatement(scope));
                    }
                });
            },
            definitions: function(scope) {
                var self = this;
                return statementsUtils.definitions(self.statements);
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