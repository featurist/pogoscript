((function() {
    var self;
    self = this;
    exports.serialiseStatements = function(statements) {
        var self, serialisedStatements, n, statement;
        self = this;
        serialisedStatements = [];
        for (n = 0; n < statements.length; n = n + 1) {
            statement = statements[n];
            statement = statement.rewrite({
                rewrite: function(term, gen1_options) {
                    var rewrite;
                    rewrite = gen1_options && gen1_options.hasOwnProperty("rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : void 0;
                    return term.serialiseSubStatements(serialisedStatements, {
                        rewrite: rewrite
                    });
                },
                limit: function(term) {
                    return term.isStatements;
                }
            });
            serialisedStatements.push(statement);
        }
        return serialisedStatements;
    };
})).call(this);