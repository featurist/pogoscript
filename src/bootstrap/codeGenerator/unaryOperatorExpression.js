(function() {
    var self, cg, macros;
    self = this;
    cg = require("../../lib/codeGenerator");
    macros = require("./macros");
    exports.newUnaryOperatorExpression = function(gen1_options) {
        var operator, expression;
        self = this;
        operator = gen1_options && gen1_options.operator != null ? gen1_options.operator : undefined;
        expression = gen1_options && gen1_options.expression != null ? gen1_options.expression : undefined;
        return cg.term(function() {
            self = this;
            self.operator = operator;
            self.expr = expression;
            return self.expression = function() {
                var foundMacro;
                self = this;
                foundMacro = macros.findMacro([ self.operator ]);
                if (foundMacro) {
                    return foundMacro([ self.operator ], [ self.expr ]);
                } else {
                    return cg.methodCall(self.expr, [ self.operator ], []);
                }
            };
        });
    };
})();