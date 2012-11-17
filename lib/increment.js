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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("++");
                return self.expression.generateJavaScript(buffer, scope);
            }
        });
    };
}).call(this);