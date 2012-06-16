((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(stmts, gen1_options) {
                var alwaysGenerateFunction, self;
                alwaysGenerateFunction = gen1_options && gen1_options.hasOwnProperty("alwaysGenerateFunction") && gen1_options.alwaysGenerateFunction !== void 0 ? gen1_options.alwaysGenerateFunction : false;
                self = this;
                self.isScope = true;
                self.statements = stmts;
                return self.alwaysGenerateFunction = alwaysGenerateFunction;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                if (self.statements.length === 1 && !self.alwaysGenerateFunction) {
                    return self.statements[0].generateJavaScript(buffer, scope);
                } else {
                    return self.cg.functionCall(self.cg.subExpression(self.cg.block([], self.cg.statements(self.statements))), []).generateJavaScript(buffer, scope);
                }
            }
        });
    };
})).call(this);