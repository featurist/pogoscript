((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(expr) {
                var self;
                self = this;
                self.isIncrement = true;
                return self.expression = expr;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                buffer.write("++");
                return self.expression.generateJavaScript(buffer, scope);
            }
        });
    };
})).call(this);