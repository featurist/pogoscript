((function() {
    var self, _, codegenUtils, statementsUtils;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    statementsUtils = require("./statementsUtils");
    module.exports = function(terms) {
        var self, createCallbackWithStatements, asyncStatements;
        self = this;
        createCallbackWithStatements = function(callbackStatements, gen1_options) {
            var resultVariable;
            resultVariable = gen1_options && gen1_options.hasOwnProperty("resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            if (callbackStatements.length === 1 && callbackStatements[0].isAsyncResult) {
                return terms.callbackFunction;
            } else {
                return terms.asyncCallback(terms.statements(callbackStatements), {
                    resultVariable: resultVariable
                });
            }
        };
        return asyncStatements = function(statements, gen2_options) {
            var returnLastStatement, forceAsync, global, madeStatementsReturn, n, gen3_forResult;
            returnLastStatement = gen2_options && gen2_options.hasOwnProperty("returnLastStatement") && gen2_options.returnLastStatement !== void 0 ? gen2_options.returnLastStatement : true;
            forceAsync = gen2_options && gen2_options.hasOwnProperty("forceAsync") && gen2_options.forceAsync !== void 0 ? gen2_options.forceAsync : false;
            global = gen2_options && gen2_options.hasOwnProperty("global") && gen2_options.global !== void 0 ? gen2_options.global : false;
            statements = statementsUtils.serialiseStatements(statements);
            madeStatementsReturn = false;
            for (n = 0; n < statements.length; n = n + 1) {
                gen3_forResult = void 0;
                if (function(n) {
                    var statement, asyncStatement, firstStatements;
                    statement = statements[n];
                    asyncStatement = statement.makeAsyncWithCallbackForResult(function(resultVariable) {
                        return createCallbackWithStatements(statements.slice(n + 1), {
                            resultVariable: resultVariable
                        });
                    });
                    if (asyncStatement) {
                        firstStatements = statements.slice(0, n);
                        firstStatements.push(asyncStatement);
                        gen3_forResult = terms.statements(firstStatements, {
                            async: true
                        });
                        return true;
                    }
                }(n)) {
                    return gen3_forResult;
                }
            }
            return terms.statements(statements, {
                global: global,
                async: forceAsync
            });
        };
    };
})).call(this);