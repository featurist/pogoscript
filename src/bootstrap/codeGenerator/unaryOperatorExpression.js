((function() {
    var self;
    self = this;
    exports.newUnaryOperatorExpression = function(gen1_options) {
        var operator, expression, self, cg;
        operator = gen1_options && gen1_options.hasOwnProperty("operator") && gen1_options.operator !== void 0 ? gen1_options.operator : void 0;
        expression = gen1_options && gen1_options.hasOwnProperty("expression") && gen1_options.expression !== void 0 ? gen1_options.expression : void 0;
        self = this;
        cg = self;
        return cg.term(function() {
            var self;
            self = this;
            self.operator = operator;
            self.expr = expression;
            self.expression = function() {
                var self, foundMacro;
                self = this;
                foundMacro = cg.macros.findMacro([ self.operator ]);
                if (foundMacro) {
                    return foundMacro([ self.operator ], [ self.expr ]);
                } else {
                    return cg.methodCall(self.expr, [ self.operator ], []);
                }
            };
            self.hashEntry = function() {
                var self;
                self = this;
                return cg.errors.addTermWithMessage(self, "cannot be a hash entry");
            };
            return self.subterms("expr");
        });
    };
})).call(this);