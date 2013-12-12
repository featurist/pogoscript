(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var scope;
        return scope = function(statementList, gen1_options) {
            var alwaysGenerateFunction;
            alwaysGenerateFunction = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "alwaysGenerateFunction") && gen1_options.alwaysGenerateFunction !== void 0 ? gen1_options.alwaysGenerateFunction : false;
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
}).call(this);