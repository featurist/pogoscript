(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expression, type) {
                var self = this;
                self.isInstanceOf = true;
                self.expression = expression;
                return self.type = type;
            },
            generate: function(scope) {
                var self = this;
                return self.code("(typeof(", self.expression.generate(scope), ") === '" + self.type + "')");
            }
        });
    };
}).call(this);