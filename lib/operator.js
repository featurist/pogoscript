(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(op, args) {
                var self = this;
                self.isOperator = true;
                self.operator = op;
                return self.operatorArguments = args;
            },
            isOperatorAlpha: function() {
                var self = this;
                return /[a-zA-Z]+/.test(self.operator);
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var alpha, n;
                buffer.write("(");
                if (self.operatorArguments.length === 1) {
                    buffer.write(self.operator);
                    if (self.isOperatorAlpha()) {
                        buffer.write(" ");
                    }
                    self.operatorArguments[0].generateJavaScript(buffer, scope);
                } else {
                    alpha = self.isOperatorAlpha();
                    self.operatorArguments[0].generateJavaScript(buffer, scope);
                    for (n = 1; n < self.operatorArguments.length; ++n) {
                        if (alpha) {
                            buffer.write(" ");
                        }
                        buffer.write(self.operator);
                        if (alpha) {
                            buffer.write(" ");
                        }
                        self.operatorArguments[n].generateJavaScript(buffer, scope);
                    }
                }
                return buffer.write(")");
            }
        });
    };
}).call(this);