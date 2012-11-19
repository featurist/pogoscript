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
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                buffer.write("throw ");
                self.expression.generateJavaScript(buffer, scope);
                return buffer.write(";");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);