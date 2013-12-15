(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(iterator, collection, stmts) {
                var self = this;
                self.isForIn = true;
                self.iterator = terms.definition(iterator, terms.nil());
                self.collection = collection;
                return self.statements = terms.subExpression(terms.functionCall(terms.block([ iterator ], stmts, {
                    returnLastStatement: false
                }), [ iterator ]));
            },
            generate: function(scope) {
                var self = this;
                return self.code("for(", self.iterator.target.generate(scope), " in ", self.collection.generate(scope), "){", self.statements.generateStatement(scope), "}");
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
                return void 0;
            }
        });
    };
}).call(this);