((function() {
    var self, _, codegenUtils;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self, createCallbackWithStatements, serialiseStatements, asyncStatements;
        self = this;
        createCallbackWithStatements = function(callbackStatements, gen1_options) {
            var resultVariable, errorVariable, catchErrorVariable, body;
            resultVariable = gen1_options && gen1_options.hasOwnProperty("resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            errorVariable = terms.generatedVariable([ "error" ]);
            catchErrorVariable = terms.generatedVariable([ "exception" ]);
            body = terms.statements(callbackStatements);
            body.rewriteResultTermInto(function(term) {
                return terms.functionCall(terms.callbackFunction, [ terms.nil(), term ]);
            });
            return terms.closure([ errorVariable, resultVariable ], terms.statements([ terms.ifExpression([ [ errorVariable, terms.statements([ terms.functionCall(terms.callbackFunction, [ errorVariable ]) ]) ] ], terms.statements([ terms.tryExpression(body, {
                catchParameter: catchErrorVariable,
                catchBody: terms.statements([ terms.functionCall(terms.callbackFunction, [ catchErrorVariable ]) ])
            }) ])) ]), {
                returnLastStatement: false
            });
        };
        serialiseStatements = function(statements) {
            var serialisedStatements, n, statement, rewrittenStatement;
            serialisedStatements = [];
            for (n = 0; n < statements.length; n = n + 1) {
                statement = statements[n];
                rewrittenStatement = statement.clone({
                    rewrite: function(term, gen2_options) {
                        var clone, path;
                        clone = gen2_options && gen2_options.hasOwnProperty("clone") && gen2_options.clone !== void 0 ? gen2_options.clone : void 0;
                        path = gen2_options && gen2_options.hasOwnProperty("path") && gen2_options.path !== void 0 ? gen2_options.path : void 0;
                        return term.serialiseSubStatements(serialisedStatements, clone, path.length === 1);
                    },
                    limit: function(term) {
                        return term.isStatements;
                    }
                });
                serialisedStatements.push(rewrittenStatement);
            }
            return serialisedStatements;
        };
        return asyncStatements = function(statements, gen3_options) {
            var returnLastStatement, forceAsync, global, madeStatementsReturn, n, gen4_forResult;
            returnLastStatement = gen3_options && gen3_options.hasOwnProperty("returnLastStatement") && gen3_options.returnLastStatement !== void 0 ? gen3_options.returnLastStatement : true;
            forceAsync = gen3_options && gen3_options.hasOwnProperty("forceAsync") && gen3_options.forceAsync !== void 0 ? gen3_options.forceAsync : false;
            global = gen3_options && gen3_options.hasOwnProperty("global") && gen3_options.global !== void 0 ? gen3_options.global : false;
            statements = serialiseStatements(statements);
            madeStatementsReturn = false;
            for (n = 0; n < statements.length; n = n + 1) {
                gen4_forResult = void 0;
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
                        gen4_forResult = terms.statements(firstStatements, {
                            async: true
                        });
                        return true;
                    }
                }(n)) {
                    return gen4_forResult;
                }
            }
            return terms.statements(statements, {
                global: global,
                async: forceAsync
            });
        };
    };
})).call(this);