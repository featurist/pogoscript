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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return self.codeIntoBuffer(buffer, function(buffer) {
                    buffer.write("(typeof(");
                    buffer.write(self.expression.generate(scope));
                    return buffer.write(") === '" + self.type + "')");
                });
            }
        });
    };
}).call(this);