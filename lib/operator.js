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
                var self;
                self = this;
                buffer.write("(");
                if (self.operatorArguments.length === 1) {
                    buffer.write(self.operator);
                    if (self.isOperatorAlpha()) {
                        buffer.write(" ");
                    }
                    self.operatorArguments[0].generateJavaScript(buffer, scope);
                } else {
                    var alpha, n;
                    alpha = self.isOperatorAlpha();
                    self.operatorArguments[0].generateJavaScript(buffer, scope);
                    for (n = 1; n < self.operatorArguments.length; n = n + 1) {
                        var gen1_forResult;
                        gen1_forResult = void 0;
                        if (function(n) {
                            if (alpha) {
                                buffer.write(" ");
                            }
                            buffer.write(self.operator);
                            if (alpha) {
                                buffer.write(" ");
                            }
                            self.operatorArguments[n].generateJavaScript(buffer, scope);
                        }(n)) {
                            return gen1_forResult;
                        }
                    }
                }
                return buffer.write(")");
            }
        });
    };
})).call(this);