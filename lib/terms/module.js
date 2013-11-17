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
                var scope;
                scope = new terms.SymbolScope(void 0);
                return self.statements.generateJavaScriptStatements(buffer, scope, {
                    global: self.global,
                    inClosure: true
                });
            }
        });
        return module = function(statements, gen2_options) {
            var inScope, global, returnLastStatement, bodyStatements;
            inScope = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "inScope") && gen2_options.inScope !== void 0 ? gen2_options.inScope : true;
            global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
            returnLastStatement = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "returnLastStatement") && gen2_options.returnLastStatement !== void 0 ? gen2_options.returnLastStatement : false;
            bodyStatements = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "bodyStatements") && gen2_options.bodyStatements !== void 0 ? gen2_options.bodyStatements : bodyStatements;
            var scope, args, errorVariable, throwIfError, methodCall;
            if (returnLastStatement) {
                statements.rewriteLastStatementToReturn({
                    async: false
                });
            }
            if (inScope) {
                scope = terms.closure([], statements, {
                    returnLastStatement: returnLastStatement,
                    redefinesSelf: true,
                    definesModuleConstants: true
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