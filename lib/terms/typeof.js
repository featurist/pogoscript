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
                buffer.write("(typeof(");
                this.expression.generateJavaScript(buffer, scope);
                return buffer.write(") === '" + this.type + "')");
            }
        });
    };
}).call(this);