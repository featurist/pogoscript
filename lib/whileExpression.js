((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(test, statements) {
                var self;
                self = this;
                self.isWhile = true;
                self.test = test;
                return self.statements = statements;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                buffer.write("while(");
                self.test.generateJavaScript(buffer, scope);
                buffer.write("){");
                self.statements.generateJavaScriptStatements(buffer, scope);
                return buffer.write("}");
            },
            generateJavaScriptStatement: function() {
                var args, self, gen1_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            },
            returnResult: function() {
                var self;
                self = this;
                return self;
            }
        });
    };
})).call(this);