((function() {
    var self, asyncControl;
    self = this;
    asyncControl = require("./asyncControl");
    module.exports = function(terms) {
        var self, tryExpressionTerm, tryExpression;
        self = this;
        tryExpressionTerm = terms.term({
            constructor: function(body, gen1_options) {
                var catchBody, catchParameter, finallyBody, self;
                catchBody = gen1_options && gen1_options.hasOwnProperty("catchBody") && gen1_options.catchBody !== void 0 ? gen1_options.catchBody : void 0;
                catchParameter = gen1_options && gen1_options.hasOwnProperty("catchParameter") && gen1_options.catchParameter !== void 0 ? gen1_options.catchParameter : void 0;
                finallyBody = gen1_options && gen1_options.hasOwnProperty("finallyBody") && gen1_options.finallyBody !== void 0 ? gen1_options.finallyBody : void 0;
                self = this;
                self.isTryExpression = true;
                self.body = body;
                self.catchBody = catchBody;
                self.catchParameter = catchParameter;
                return self.finallyBody = finallyBody;
            },
            generateJavaScriptStatement: function(buffer, scope, returnStatements) {
                var self;
                self = this;
                buffer.write("try{");
                if (returnStatements) {
                    self.body.generateJavaScriptStatementsReturn(buffer, scope);
                } else {
                    self.body.generateJavaScriptStatements(buffer, scope);
                }
                buffer.write("}");
                if (self.catchBody) {
                    buffer.write("catch(");
                    self.catchParameter.generateJavaScript(buffer, scope);
                    buffer.write("){");
                    if (returnStatements) {
                        self.catchBody.generateJavaScriptStatementsReturn(buffer, scope);
                    } else {
                        self.catchBody.generateJavaScriptStatements(buffer, scope);
                    }
                    buffer.write("}");
                }
                if (self.finallyBody) {
                    buffer.write("finally{");
                    self.finallyBody.generateJavaScriptStatements(buffer, scope);
                    return buffer.write("}");
                }
            },
            generateJavaScript: function(buffer, symbolScope) {
                var self;
                self = this;
                if (self.alreadyCalled) {
                    throw new Error("stuff");
                }
                self.alreadyCalled = true;
                return self.cg.scope([ self ], {
                    alwaysGenerateFunction: true
                }).generateJavaScript(buffer, symbolScope);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self;
                self = this;
                self.body.rewriteResultTermInto(returnTerm);
                if (self.catchBody) {
                    self.catchBody.rewriteResultTermInto(returnTerm);
                }
                return self;
            }
        });
        return tryExpression = function(body, gen2_options) {
            var catchBody, catchParameter, finallyBody, asyncTryFunction;
            catchBody = gen2_options && gen2_options.hasOwnProperty("catchBody") && gen2_options.catchBody !== void 0 ? gen2_options.catchBody : void 0;
            catchParameter = gen2_options && gen2_options.hasOwnProperty("catchParameter") && gen2_options.catchParameter !== void 0 ? gen2_options.catchParameter : void 0;
            finallyBody = gen2_options && gen2_options.hasOwnProperty("finallyBody") && gen2_options.finallyBody !== void 0 ? gen2_options.finallyBody : void 0;
            if (body.isAsync || catchBody && catchBody.isAsync || finallyBody && finallyBody.isAsync) {
                asyncTryFunction = terms.moduleConstants.defineAs([ "async", "try" ], terms.javascript(asyncControl.try.toString()));
                return terms.functionCall(asyncTryFunction, [ terms.argumentUtils.asyncifyBody(body), terms.argumentUtils.asyncifyBody(catchBody, [ catchParameter ]), terms.argumentUtils.asyncifyBody(finallyBody) ], {
                    async: true
                });
            } else {
                return tryExpressionTerm(body, {
                    catchBody: catchBody,
                    catchParameter: catchParameter,
                    finallyBody: finallyBody
                });
            }
        };
    };
})).call(this);