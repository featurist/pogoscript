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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("(");
                self.expression.generateJavaScript(buffer, scope);
                return buffer.write(")");
            }
        });
    };
}).call(this);