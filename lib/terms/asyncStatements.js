(function() {
    var self = this;
    var _, codegenUtils, statementsUtils;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    statementsUtils = require("./statementsUtils");
    module.exports = function(terms) {
        var self = this;
        var createCallbackWithStatements, putStatementsInCallbackForNextAsyncCall, asyncStatements;
        createCallbackWithStatements = function(callbackStatements, gen1_options) {
            var resultVariable, forceAsync, containsContinuation;
            resultVariable = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            forceAsync = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "forceAsync") && gen1_options.forceAsync !== void 0 ? gen1_options.forceAsync : false;
            containsContinuation = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "containsContinuation") && gen1_options.containsContinuation !== void 0 ? gen1_options.containsContinuation : containsContinuation;
            var asyncStmts;
            if (callbackStatements.length === 1 && callbackStatements[0].isAsyncResult) {
                return terms.onFulfilledFunction;
            } else {
                asyncStmts = putStatementsInCallbackForNextAsyncCall(callbackStatements, {
                    forceAsync: forceAsync,
                    forceNotAsync: true,
                    definitions: []
                });
                return terms.asyncCallback(asyncStmts, {
                    resultVariable: resultVariable
                });
            }
        };
        putStatementsInCallbackForNextAsyncCall = function(statements, gen2_options) {
            var forceAsync, forceNotAsync, definitions;
            forceAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "forceAsync") && gen2_options.forceAsync !== void 0 ? gen2_options.forceAsync : false;
            forceNotAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "forceNotAsync") && gen2_options.forceNotAsync !== void 0 ? gen2_options.forceNotAsync : false;
            definitions = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "definitions") && gen2_options.definitions !== void 0 ? gen2_options.definitions : void 0;
            var containsContinuation, n, gen3_forResult;
            containsContinuation = function() {
                if (statements.length > 0) {
                    return function() {
                        var gen4_results, gen5_items, gen6_i, stmt;
                        gen4_results = [];
                        gen5_items = statements;
                        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                            stmt = gen5_items[gen6_i];
                            gen4_results.push(stmt.containsContinuation());
                        }
                        return gen4_results;
                    }().reduce(function(l, r) {
                        return l || r;
                    });
                } else {
                    return false;
                }
            }();
            for (n = 0; n < statements.length; ++n) {
                gen3_forResult = void 0;
                if (function(n) {
                    var statement, asyncStatement, firstStatements;
                    statement = statements[n];
                    asyncStatement = statement.makeAsyncWithCallbackForResult(function(resultVariable) {
                        return createCallbackWithStatements(statements.slice(n + 1), {
                            resultVariable: resultVariable,
                            forceAsync: forceAsync,
                            containsContinuation: containsContinuation
                        });
                    });
                    if (asyncStatement) {
                        firstStatements = statements.slice(0, n);
                        firstStatements.push(asyncStatement);
                        gen3_forResult = terms.statements(firstStatements, {
                            async: !forceNotAsync,
                            definitions: []
                        });
                        return true;
                    }
                }(n)) {
                    return gen3_forResult;
                }
            }
            return terms.statements(statements, {
                async: forceAsync,
                definitions: definitions
            });
        };
        return asyncStatements = function(statements, gen7_options) {
            var forceAsync;
            forceAsync = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "forceAsync") && gen7_options.forceAsync !== void 0 ? gen7_options.forceAsync : false;
            var definitions, serialisedStatements, stmts;
            definitions = statementsUtils.definitions(statements);
            serialisedStatements = statementsUtils.serialiseStatements(statements);
            stmts = putStatementsInCallbackForNextAsyncCall(serialisedStatements, {
                forceAsync: forceAsync,
                definitions: definitions
            });
            if (stmts.isAsync) {
                return stmts.promisify({
                    definitions: definitions,
                    statements: true
                });
            } else {
                return stmts;
            }
        };
    };
}).call(this);