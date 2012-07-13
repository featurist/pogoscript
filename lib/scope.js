((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, scope;
        self = this;
        return scope = function(statements, alwaysGenerateFunction) {
            if (statements.length === 1 && !alwaysGenerateFunction) {
                return statements[0];
            } else {
                return terms.functionCall(terms.subExpression(terms.block([], terms.statements(statements))), []);
            }
        };
    };
})).call(this);