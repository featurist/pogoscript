((function() {
    var self, _, codegenUtils;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(cg) {
        var self;
        self = this;
        return cg.term({
            constructor: function(statements, gen1_options) {
                var expression, self;
                expression = gen1_options && gen1_options.hasOwnProperty("expression") && gen1_options.expression !== void 0 ? gen1_options.expression : false;
                self = this;
                self.isStatements = true;
                self.statements = statements;
                return self.isExpressionStatements = expression;
            },
            generateStatements: function(statements, buffer, scope, global, generateReturn) {
                var self, serialisedStatements, declaredVariables, s;
                self = this;
                serialisedStatements = self.serialiseStatements(statements);
                declaredVariables = self.findDeclaredVariables(scope);
                self.generateVariableDeclarations(declaredVariables, buffer, scope, global);
                for (s = 0; s < serialisedStatements.length; s = s + 1) {
                    var statement;
                    statement = serialisedStatements[s];
                    if (s === serialisedStatements.length - 1 && generateReturn) {
                        statement.generateJavaScriptReturn(buffer, scope);
                    } else {
                        statement.generateJavaScriptStatement(buffer, scope);
                    }
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
            serialiseStatements: function(statements) {
                var self, serialisedStatements, gen2_items, gen3_i;
                self = this;
                serialisedStatements = [];
                gen2_items = statements;
                for (gen3_i = 0; gen3_i < gen2_items.length; gen3_i++) {
                    var statement;
                    statement = gen2_items[gen3_i];
                    statement.serialiseSubStatements(serialisedStatements);
                    statement.walkDescendantsNotBelowIf(function(subterm) {
                        return subterm.serialiseSubStatements(serialisedStatements);
                    }, function(subterm) {
                        return subterm.isStatements;
                    });
                    serialisedStatements.push(statement);
                }
                return serialisedStatements;
            },
            serialiseSubStatements: function(statements) {
                var self;
                self = this;
                if (self.isExpressionStatements) {
                    var firstStatements, gen4_o;
                    firstStatements = self.statements.slice(0, self.statements.length - 1);
                    gen4_o = statements;
                    return gen4_o.push.apply(gen4_o, firstStatements);
                }
            },
            generateJavaScriptStatements: function(buffer, scope, global) {
                var self;
                self = this;
                return self.generateStatements(self.statements, buffer, scope, global);
            },
            blockify: function(parameters, optionalParameters) {
                var self, statements, b;
                self = this;
                statements = function() {
                    if (self.isExpressionStatements) {
                        return self.cg.statements([ self ]);
                    } else {
                        return self;
                    }
                }();
                b = self.cg.block(parameters, statements);
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