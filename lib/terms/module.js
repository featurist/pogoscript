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
            generateModule: function() {
                var self = this;
                var scope;
                scope = new terms.SymbolScope(void 0);
                return self.code(self.statements.generateStatements(scope, {
                    global: self.global,
                    inClosure: true
                }));
            }
        });
        return module = function(statements, gen2_options) {
            var inScope, global, returnLastStatement, bodyStatements;
            inScope = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "inScope") && gen2_options.inScope !== void 0 ? gen2_options.inScope : true;
            global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
            returnLastStatement = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "returnLastStatement") && gen2_options.returnLastStatement !== void 0 ? gen2_options.returnLastStatement : false;
            bodyStatements = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "bodyStatements") && gen2_options.bodyStatements !== void 0 ? gen2_options.bodyStatements : bodyStatements;
            var scope, args, methodCall, call;
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
                methodCall = terms.methodCall(terms.subExpression(scope), [ "call" ], args);
                call = function() {
                    if (statements.isAsync) {
                        return methodCall;
                    } else {
                        return methodCall;
                    }
                }();
                return moduleTerm(terms.statements([ call ]), {
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