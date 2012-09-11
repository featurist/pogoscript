((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, scope;
        self = this;
        return scope = function(statements, alwaysGenerateFunction) {
            var statement;
            if (statements.length === 1 && !alwaysGenerateFunction) {
                statement = statements[0];
                if (statement.isReturn) {
                    return statement.expression;
                } else {
                    return statement;
                }
            } else {
                return terms.functionCall(terms.subExpression(terms.block([], terms.statements(statements))), []);
            }
        };
    };
})).call(this);