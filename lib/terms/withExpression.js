(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var withExpressionTerm, withExpression;
        withExpressionTerm = terms.term({
            constructor: function(subject, statements) {
                var self = this;
                self.isWith = true;
                self.subject = subject;
                return self.statements = statements;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return self.codeIntoBuffer(buffer, function(buffer) {
                    buffer.write("with(");
                    buffer.write(self.subject.generate(scope));
                    buffer.write("){");
                    buffer.write(self.statements.generateStatements(scope));
                    return buffer.write("}");
                });
            },
            generateStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generate.apply(gen1_o, args);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
        return withExpression = function(subject, statements) {
            return withExpressionTerm(subject, statements);
        };
    };
}).call(this);