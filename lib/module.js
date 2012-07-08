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
                return self.returnResult = false;
            },
            generateJavaScript: function(buffer, scope, global) {
                var self;
                self = this;
                if (self.returnResult) {
                    return self.statements.generateJavaScriptStatementsReturn(buffer, new terms.SymbolScope, self.global);
                } else {
                    return self.statements.generateJavaScriptStatements(buffer, new terms.SymbolScope, self.global);
                }
            },
            expandMacro: function() {
                var self, b, call;
                self = this;
                if (self.inScope) {
                    b = terms.closure([], self.statements, {
                        returnLastStatement: false,
                        redefinesSelf: true
                    });
                    call = terms.methodCall(terms.subExpression(b), [ "call" ], [ terms.variable([ "this" ]) ]);
                    return terms.module(terms.statements([ call ]).expandMacros());
                }
            }
        });
    };
})).call(this);