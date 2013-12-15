(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expression) {
                var self = this;
                self.isSubExpression = true;
                return self.expression = expression;
            },
            generate: function(scope) {
                var self = this;
                return self.code("(", self.expression.generate(scope), ")");
            }
        });
    };
}).call(this);