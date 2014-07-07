(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var scope;
        return scope = function(statementList, gen1_options) {
            var alwaysGenerateFunction, variables;
            alwaysGenerateFunction = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "alwaysGenerateFunction") && gen1_options.alwaysGenerateFunction !== void 0 ? gen1_options.alwaysGenerateFunction : false;
            variables = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "variables") && gen1_options.variables !== void 0 ? gen1_options.variables : [];
            var statement, statements, fn;
            if (statementList.length === 1 && !alwaysGenerateFunction) {
                statement = statementList[0];
                if (statement.isReturn) {
                    return statement.expression;
                } else {
                    return statement;
                }
            } else {
                statements = terms.asyncStatements(statementList);
                fn = terms.functionCall(terms.subExpression(terms.block(variables, statements)), variables);
                if (statements.returnsPromise) {
                    return terms.resolve(fn.alreadyPromise());
                } else {
                    return fn;
                }
            }
        };
    };
}).call(this);