((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, postIncrement, forEach;
        self = this;
        postIncrement = terms.term({
            constructor: function(expr) {
                var self;
                self = this;
                return self.expression = expr;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                self.expression.generateJavaScript(buffer, scope);
                return buffer.write("++");
            }
        });
        return forEach = function(collection, itemVariable, stmts) {
            var itemsVar, indexVar, s, gen1_o, statementsWithItemAssignment, init, test, incr;
            itemsVar = terms.generatedVariable([ "items" ]);
            indexVar = terms.generatedVariable([ "i" ]);
            s = [ terms.definition(itemVariable, terms.indexer(itemsVar, indexVar)) ];
            gen1_o = s;
            gen1_o.push.apply(gen1_o, stmts.statements);
            statementsWithItemAssignment = terms.statements(s);
            init = terms.definition(indexVar, terms.integer(0));
            test = terms.operator("<", [ indexVar, terms.fieldReference(itemsVar, [ "length" ]) ]);
            incr = postIncrement(indexVar);
            return terms.statements([ terms.definition(itemsVar, collection), terms.forStatement(init, test, incr, statementsWithItemAssignment) ], {
                expression: true
            });
        };
    };
})).call(this);