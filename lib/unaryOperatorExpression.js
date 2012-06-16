((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(operator, expression) {
                var self;
                self = this;
                self.operator = operator;
                return self.expr = expression;
            },
            expression: function() {
                var self, foundMacro;
                self = this;
                foundMacro = self.cg.macros.findMacro([ self.operator ]);
                if (foundMacro) {
                    return foundMacro([ self.operator ], [ self.expr ]);
                } else {
                    return self.cg.methodCall(self.expr, [ self.operator ], []);
                }
            },
            hashEntry: function() {
                var self;
                self = this;
                return self.cg.errors.addTermWithMessage(self, "cannot be a hash entry");
            }
        });
    };
})).call(this);