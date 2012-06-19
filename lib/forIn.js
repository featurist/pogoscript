((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(iterator, collection, stmts) {
                var self;
                self = this;
                self.isForIn = true;
                self.iterator = iterator;
                self.collection = collection;
                return self.statements = stmts;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                buffer.write("for(");
                self.iterator.generateJavaScript(buffer, scope);
                buffer.write(" in ");
                self.collection.generateJavaScript(buffer, scope);
                buffer.write("){");
                self.cg.subExpression(self.cg.functionCall(self.cg.block([ self.iterator ], self.statements, {
                    returnLastStatement: false
                }), [ self.iterator ])).generateJavaScriptStatement(buffer, scope);
                return buffer.write("}");
            },
            generateJavaScriptStatement: function() {
                var args, self, gen1_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            },
            generateJavaScriptReturn: function() {
                var args, self, gen2_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            declareVariables: function(variables, scope) {
                var self;
                self = this;
                return self.iterator.declareVariable(variables, scope);
            }
        });
    };
})).call(this);