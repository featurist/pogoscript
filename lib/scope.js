(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var scope;
        return scope = function(statementList) {
            var statement, statements;
            if (statementList.length === 1) {
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
}).call(this);