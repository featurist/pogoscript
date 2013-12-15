(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expr) {
                var self = this;
                self.isThrow = true;
                return self.expression = expr;
            },
            generateStatement: function(scope) {
                var self = this;
                return self.code("throw ", self.expression.generate(scope), ";");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);