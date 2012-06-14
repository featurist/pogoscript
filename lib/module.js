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
                if (self.inScope) {
                    var b;
                    b = self.cg.block([], self.statements, {
                        returnLastStatement: false,
                        redefinesSelf: true
                    });
                    self.cg.methodCall(self.cg.subExpression(b), [ "call" ], [ self.cg.variable([ "this" ]) ]).generateJavaScript(buffer, new self.cg.Scope);
                    return buffer.write(";");
                } else {
                    if (self.returnResult) {
                        return self.statements.generateJavaScriptStatementsReturn(buffer, new self.cg.Scope, self.global);
                    } else {
                        return self.statements.generateJavaScriptStatements(buffer, new self.cg.Scope, self.global);
                    }
                }
            }
        });
    };
})).call(this);