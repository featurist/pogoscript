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
                rewrite: function(term) {
                    return term.serialiseSubStatements(serialisedStatements);
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