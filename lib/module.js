((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(statements) {
                var self;
                self = this;
                self.statements = statements;
                self.isModule = true;
                self.inScope = true;
                self.global = false;
                return self.returnLastStatement = false;
            },
            generateJavaScriptModule: function(buffer) {
                var self;
                self = this;
                return self.statements.generateJavaScriptStatements(buffer, new terms.SymbolScope, self.global);
            },
            expandMacro: function(clone) {
                var self, b, methodCall, statements;
                self = this;
                if (self.inScope) {
                    b = terms.closure([], self.statements, {
                        returnLastStatement: false,
                        redefinesSelf: true
                    });
                    methodCall = clone(terms.methodCall(terms.subExpression(b), [ "call" ], [ terms.variable([ "this" ]) ]));
                    return terms.module(terms.statements([ methodCall ]));
                } else {
                    statements = clone().statements.rewriteAsyncCallbacks({
                        returnLastStatement: self.returnLastStatement
                    });
                    statements.global = self.global;
                    statements;
                    return terms.module(statements);
                }
            }
        });
    };
})).call(this);