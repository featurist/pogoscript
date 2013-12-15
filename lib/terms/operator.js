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
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var alpha, n;
                    buffer.write("(");
                    if (self.operatorArguments.length === 1) {
                        buffer.write(self.operator);
                        if (self.isOperatorAlpha()) {
                            buffer.write(" ");
                        }
                        buffer.write(self.operatorArguments[0].generate(scope));
                    } else {
                        alpha = self.isOperatorAlpha();
                        buffer.write(self.operatorArguments[0].generate(scope));
                        for (n = 1; n < self.operatorArguments.length; ++n) {
                            if (alpha) {
                                buffer.write(" ");
                            }
                            buffer.write(self.operator);
                            if (alpha) {
                                buffer.write(" ");
                            }
                            buffer.write(self.operatorArguments[n].generate(scope));
                        }
                    }
                    return buffer.write(")");
                });
            }
        });
    };
}).call(this);