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
                var self, scope, definitions, gen2_o;
                self = this;
                scope = new terms.SymbolScope(void 0);
                definitions = terms.moduleConstants.definitions();
                gen2_o = self.statements.statements;
                gen2_o.unshift.apply(gen2_o, definitions);
                return self.statements.generateJavaScriptStatements(buffer, scope, self.global);
            }
        });
        return module = function(statements, gen3_options) {
            var inScope, global, returnLastStatement, scope, args, errorVariable, throwIfError, methodCall;
            inScope = gen3_options && gen3_options.hasOwnProperty("inScope") && gen3_options.inScope !== void 0 ? gen3_options.inScope : true;
            global = gen3_options && gen3_options.hasOwnProperty("global") && gen3_options.global !== void 0 ? gen3_options.global : false;
            returnLastStatement = gen3_options && gen3_options.hasOwnProperty("returnLastStatement") && gen3_options.returnLastStatement !== void 0 ? gen3_options.returnLastStatement : false;
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