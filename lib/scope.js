((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, scope;
        self = this;
        return scope = function(statementList, alwaysGenerateFunction) {
            var statement, statements;
            if (statementList.length === 1 && !alwaysGenerateFunction) {
                statement = statementList[0];
                if (statement.isReturn) {
                    return statement.expression;
                } else {
                    return statement;
                }
            } else {
                statements = terms.asyncStatements(statementList);
                return terms.functionCall(terms.subExpression(terms.block([], statements)), [], {
                    async: statements.isAsync
                });
            }
        };
    };
})).call(this);