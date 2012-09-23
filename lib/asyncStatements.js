((function() {
    var self, _, codegenUtils, statementsUtils;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    statementsUtils = require("./statementsUtils");
    module.exports = function(terms) {
        var self, createCallbackWithStatements, putStatementsInCallbackForNextAsyncCall, asyncStatements;
        self = this;
        createCallbackWithStatements = function(callbackStatements, gen1_options) {
            var resultVariable, forceAsync, global, asyncStmts;
            resultVariable = gen1_options && gen1_options.hasOwnProperty("resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            forceAsync = gen1_options && gen1_options.hasOwnProperty("forceAsync") && gen1_options.forceAsync !== void 0 ? gen1_options.forceAsync : false;
            global = gen1_options && gen1_options.hasOwnProperty("global") && gen1_options.global !== void 0 ? gen1_options.global : false;
            debugger
            if (callbackStatements.length === 1 && callbackStatements[0].isAsyncResult) {
                return terms.callbackFunction;
            } else {
                asyncStmts = putStatementsInCallbackForNextAsyncCall(callbackStatements, {
                    forceAsync: forceAsync,
                    forceNotAsync: true,
                    global: global
                });
                return terms.asyncCallback(asyncStmts, {
                    resultVariable: resultVariable
                });
            }
        };
        putStatementsInCallbackForNextAsyncCall = function(statements, gen2_options) {
            var forceAsync, forceNotAsync, global, n, gen3_forResult;
            forceAsync = gen2_options && gen2_options.hasOwnProperty("forceAsync") && gen2_options.forceAsync !== void 0 ? gen2_options.forceAsync : false;
            forceNotAsync = gen2_options && gen2_options.hasOwnProperty("forceNotAsync") && gen2_options.forceNotAsync !== void 0 ? gen2_options.forceNotAsync : false;
            global = gen2_options && gen2_options.hasOwnProperty("global") && gen2_options.global !== void 0 ? gen2_options.global : false;
            for (n = 0; n < statements.length; n = n + 1) {
                gen3_forResult = void 0;
                if (function(n) {
                    var statement, asyncStatement, firstStatements;
                    statement = statements[n];
                    asyncStatement = statement.makeAsyncWithCallbackForResult(function(resultVariable) {
                        return createCallbackWithStatements(statements.slice(n + 1), {
                            resultVariable: resultVariable,
                            forceAsync: forceAsync,
                            global: global
                        });
                    });
                    if (asyncStatement) {
                        firstStatements = statements.slice(0, n);
                        firstStatements.push(asyncStatement);
                        gen3_forResult = terms.statements(firstStatements, {
                            async: true && !forceNotAsync
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
        return asyncStatements = function(statements, gen4_options) {
            var forceAsync, global;
            forceAsync = gen4_options && gen4_options.hasOwnProperty("forceAsync") && gen4_options.forceAsync !== void 0 ? gen4_options.forceAsync : false;
            global = gen4_options && gen4_options.hasOwnProperty("global") && gen4_options.global !== void 0 ? gen4_options.global : false;
            statements = statementsUtils.serialiseStatements(statements);
            return putStatementsInCallbackForNextAsyncCall(statements, {
                forceAsync: forceAsync,
                global: global
            });
        };
    };
})).call(this);