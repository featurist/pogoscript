(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expr) {
                var self = this;
                self.isIncrement = true;
                return self.expression = expr;
            },
            generate: function(scope) {
                var self = this;
                return self.code("++", self.expression.generate(scope));
            }
        });
    };
}).call(this);