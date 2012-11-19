(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var forEach;
        return forEach = function(collection, itemVariable, stmts) {
            var itemsVar, indexVar, s, gen1_o, statementsWithItemAssignment, init, test, incr;
            itemsVar = terms.generatedVariable([ "items" ]);
            indexVar = terms.generatedVariable([ "i" ]);
            s = [ terms.definition(itemVariable, terms.indexer(itemsVar, indexVar)) ];
            gen1_o = s;
            gen1_o.push.apply(gen1_o, stmts.statements);
            statementsWithItemAssignment = terms.statements(s, {
                async: stmts.isAsync
            });
            init = terms.definition(indexVar, terms.integer(0));
            test = terms.operator("<", [ indexVar, terms.fieldReference(itemsVar, [ "length" ]) ]);
            incr = terms.increment(indexVar);
            return terms.subStatements([ terms.definition(itemsVar, collection), terms.forStatement(init, test, incr, statementsWithItemAssignment) ]);
        };
    };
}).call(this);