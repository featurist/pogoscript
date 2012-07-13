((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(op, args) {
                var self;
                self = this;
                self.isOperator = true;
                self.operator = op;
                return self.operatorArguments = args;
            },
            isOperatorAlpha: function() {
                var self;
                self = this;
                return /[a-zA-Z]+/.test(self.operator);
            },
            generateJavaScript: function(buffer, scope) {
                var self, alpha, n;
                self = this;
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
                    for (n = 1; n < self.operatorArguments.length; n = n + 1) {
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
})).call(this);