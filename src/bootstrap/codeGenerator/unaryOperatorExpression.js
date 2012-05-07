((function() {
    var self, cg, macros, errors;
    self = this;
    cg = require("../../lib/codeGenerator");
    macros = require("./macros");
    errors = require("./errors");
    exports.newUnaryOperatorExpression = function(gen1_options) {
        var operator, expression, self;
        operator = gen1_options && gen1_options.operator != null ? gen1_options.operator : void 0;
        expression = gen1_options && gen1_options.expression != null ? gen1_options.expression : void 0;
        self = this;
        return cg.term(function() {
            var self;
            self = this;
            self.operator = operator;
            self.expr = expression;
            self.expression = function() {
                var self, foundMacro;
                self = this;
                foundMacro = macros.findMacro([ self.operator ]);
                if (foundMacro) {
                    return foundMacro([ self.operator ], [ self.expr ]);
                } else {
                    return cg.methodCall(self.expr, [ self.operator ], []);
                }
            };
            self.hashEntry = function() {
                var self;
                self = this;
                return errors.addTermWithMessage(self, "cannot be a hash entry");
            };
            return self.subterms("expr");
        });
    };
})).call(this);