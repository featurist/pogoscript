((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, moduleTerm, module;
        self = this;
        moduleTerm = terms.term({
            constructor: function(statements, gen1_options) {
                var global, returnLastStatement, self;
                global = gen1_options && gen1_options.hasOwnProperty("global") && gen1_options.global !== void 0 ? gen1_options.global : false;
                returnLastStatement = gen1_options && gen1_options.hasOwnProperty("returnLastStatement") && gen1_options.returnLastStatement !== void 0 ? gen1_options.returnLastStatement : false;
                self = this;
                self.statements = statements;
                self.isModule = true;
                return self.global = global;
            },
            generateJavaScriptModule: function(buffer) {
                var self;
                self = this;
                return self.statements.generateJavaScriptStatements(buffer, new terms.SymbolScope(void 0), self.global);
            }
        });
        return module = function(statements, gen2_options) {
            var inScope, global, returnLastStatement, scope, args, errorVariable, throwIfError, methodCall;
            inScope = gen2_options && gen2_options.hasOwnProperty("inScope") && gen2_options.inScope !== void 0 ? gen2_options.inScope : true;
            global = gen2_options && gen2_options.hasOwnProperty("global") && gen2_options.global !== void 0 ? gen2_options.global : false;
            returnLastStatement = gen2_options && gen2_options.hasOwnProperty("returnLastStatement") && gen2_options.returnLastStatement !== void 0 ? gen2_options.returnLastStatement : false;
            if (returnLastStatement) {
                statements.rewriteLastStatementToReturn({
                    async: false
                });
            }
            statements.global = global;
            if (inScope) {
                scope = terms.closure([], statements, {
                    returnLastStatement: returnLastStatement,
                    redefinesSelf: true
                });
                args = [ terms.variable([ "this" ]) ];
                if (statements.isAsync) {
                    errorVariable = terms.generatedVariable([ "error" ]);
                    throwIfError = terms.ifExpression([ [ errorVariable, terms.statements([ terms.throwStatement(errorVariable) ]) ] ]);
                    args.push(terms.closure([ errorVariable ], terms.statements([ throwIfError ])));
                }
                methodCall = terms.methodCall(terms.subExpression(scope), [ "call" ], args);
                return moduleTerm(terms.statements([ methodCall ]));
            } else {
                return moduleTerm(statements, {
                    global: global,
                    returnLastStatement: returnLastStatement
                });
            }
        };
    };
})).call(this);