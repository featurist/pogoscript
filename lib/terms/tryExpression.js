(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var tryExpressionTerm, tryExpression;
        tryExpressionTerm = terms.term({
            constructor: function(body, gen1_options) {
                var self = this;
                var catchBody, catchParameter, finallyBody;
                catchBody = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "catchBody") && gen1_options.catchBody !== void 0 ? gen1_options.catchBody : void 0;
                catchParameter = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "catchParameter") && gen1_options.catchParameter !== void 0 ? gen1_options.catchParameter : void 0;
                finallyBody = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "finallyBody") && gen1_options.finallyBody !== void 0 ? gen1_options.finallyBody : void 0;
                self.isTryExpression = true;
                self.body = body;
                self.catchBody = catchBody;
                self.catchParameter = catchParameter;
                return self.finallyBody = finallyBody;
            },
            generateStatement: function(scope, returnStatements) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    buffer.write("try{");
                    if (returnStatements) {
                        buffer.write(self.body.generateStatementsReturn(scope));
                    } else {
                        buffer.write(self.body.generateStatements(scope));
                    }
                    buffer.write("}");
                    if (self.catchBody) {
                        buffer.write("catch(");
                        buffer.write(self.catchParameter.generate(scope));
                        buffer.write("){");
                        if (returnStatements) {
                            buffer.write(self.catchBody.generateStatementsReturn(scope));
                        } else {
                            buffer.write(self.catchBody.generateStatements(scope));
                        }
                        buffer.write("}");
                    }
                    if (self.finallyBody) {
                        buffer.write("finally{");
                        buffer.write(self.finallyBody.generateStatements(scope));
                        return buffer.write("}");
                    }
                });
            },
            generateJavaScript: function(buffer, symbolScope) {
                var self = this;
                return self.codeIntoBuffer(buffer, function(buffer) {
                    if (self.alreadyCalled) {
                        throw new Error("stuff");
                    }
                    self.alreadyCalled = true;
                    return buffer.write(self.cg.scope([ self ], {
                        alwaysGenerateFunction: true
                    }).generate(symbolScope));
                });
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                self.body.rewriteResultTermInto(returnTerm);
                if (self.catchBody) {
                    self.catchBody.rewriteResultTermInto(returnTerm);
                }
                return self;
            }
        });
        return tryExpression = function(body, gen2_options) {
            var catchBody, catchParameter, finallyBody;
            catchBody = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "catchBody") && gen2_options.catchBody !== void 0 ? gen2_options.catchBody : void 0;
            catchParameter = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "catchParameter") && gen2_options.catchParameter !== void 0 ? gen2_options.catchParameter : void 0;
            finallyBody = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "finallyBody") && gen2_options.finallyBody !== void 0 ? gen2_options.finallyBody : void 0;
            var asyncTryFunction;
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
}).call(this);