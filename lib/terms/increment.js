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
                return self.codeIntoBuffer(buffer, function(buffer) {
                    buffer.write("++");
                    return buffer.write(self.expression.generate(scope));
                });
            }
        });
    };
}).call(this);