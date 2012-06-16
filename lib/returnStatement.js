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
                self.isReturn = true;
                return self.expression = expr;
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self;
                self = this;
                if (self.expression) {
                    return self.expression.generateJavaScriptReturn(buffer, scope);
                } else {
                    return buffer.write("return;");
                }
            },
            generateJavaScriptReturn: function() {
                var args, self, gen1_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen1_o = self;
                return gen1_o.generateJavaScriptStatement.apply(gen1_o, args);
            }
        });
    };
})).call(this);