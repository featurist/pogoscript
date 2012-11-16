(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var moduleTerm, module;
        moduleTerm = terms.term({
            constructor: function(statements, gen1_options) {
                var self = this;
                var global, returnLastStatement, bodyStatements;
                global = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "global") && gen1_options.global !== void 0 ? gen1_options.global : false;
                returnLastStatement = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnLastStatement") && gen1_options.returnLastStatement !== void 0 ? gen1_options.returnLastStatement : false;
                bodyStatements = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "bodyStatements") && gen1_options.bodyStatements !== void 0 ? gen1_options.bodyStatements : void 0;
                self.statements = statements;
                self.isModule = true;
                self.global = global;
                return self.bodyStatements = bodyStatements || statements;
            },
            generateJavaScriptModule: function(buffer) {
                var self = this;
                var scope, definitions, gen2_o;
                scope = new terms.SymbolScope(void 0);
                definitions = terms.moduleConstants.definitions();
                gen2_o = self.bodyStatements.statements;
                gen2_o.unshift.apply(gen2_o, definitions);
                return self.statements.generateJavaScriptStatements(buffer, scope, {
                    global: self.global,
                    inClosure: true
                });
            }
        });
        return module = function(statements, gen3_options) {
            var inScope, global, returnLastStatement, bodyStatements;
            inScope = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "inScope") && gen3_options.inScope !== void 0 ? gen3_options.inScope : true;
            global = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "global") && gen3_options.global !== void 0 ? gen3_options.global : false;
            returnLastStatement = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "returnLastStatement") && gen3_options.returnLastStatement !== void 0 ? gen3_options.returnLastStatement : false;
            bodyStatements = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "bodyStatements") && gen3_options.bodyStatements !== void 0 ? gen3_options.bodyStatements : bodyStatements;
            var scope, args, errorVariable, throwIfError, methodCall;
            if (returnLastStatement) {
                statements.rewriteLastStatementToReturn({
                    async: false
                });
            }
            if (inScope) {
                scope = terms.closure([], statements, {
                    returnLastStatement: returnLastStatement,
                    redefinesSelf: true
                });
                args = [ terms.variable([ "this" ]) ];
                if (statements.isAsync) {
                    errorVariable = terms.generatedVariable([ "error" ]);
                    throwIfError = terms.ifExpression([ {
                        condition: errorVariable,
                        body: terms.statements([ terms.functionCall(terms.variable([ "set", "timeout" ]), [ terms.closure([], terms.statements([ terms.throwStatement(errorVariable) ])), terms.integer(0) ]) ])
                    } ]);
                    args.push(terms.closure([ errorVariable ], terms.statements([ throwIfError ])));
                }
                methodCall = terms.methodCall(terms.subExpression(scope), [ "call" ], args);
                return moduleTerm(terms.statements([ methodCall ]), {
                    bodyStatements: statements,
                    global: global
                });
            } else {
                return moduleTerm(statements, {
                    global: global,
                    returnLastStatement: returnLastStatement,
                    bodyStatements: bodyStatements
                });
            }
        };
    };
}).call(this);