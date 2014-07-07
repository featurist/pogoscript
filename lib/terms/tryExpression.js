(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var tryExpressionTerm, catchClause, finallyClause, tryExpression;
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
                    buffer.write(self.body.generateStatements(scope));
                    buffer.write("}");
                    if (self.catchBody) {
                        buffer.write("catch(");
                        buffer.write(self.catchParameter.generate(scope));
                        buffer.write("){");
                        buffer.write(self.catchBody.generateStatements(scope));
                        buffer.write("}");
                    }
                    if (self.finallyBody) {
                        buffer.write("finally{");
                        buffer.write(self.finallyBody.generateStatements(scope));
                        return buffer.write("}");
                    }
                });
            },
            generate: function(symbolScope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
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
        catchClause = function(body, catchParameter, catchBody) {
            return terms.methodCall(body, [ "then" ], [ terms.nil(), terms.closure([ catchParameter ], catchBody) ]).alreadyPromise();
        };
        finallyClause = function(body, finallyBody) {
            var result, finallyBlock;
            result = terms.generatedVariable([ "result" ]);
            finallyBlock = function(gen2_options) {
                var throwResult;
                throwResult = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "throwResult") && gen2_options.throwResult !== void 0 ? gen2_options.throwResult : false;
                var resultStatement;
                resultStatement = function() {
                    if (throwResult) {
                        return terms.throwStatement(result);
                    } else {
                        return result;
                    }
                }();
                return terms.closure([ result ], terms.statements([ terms.methodCall(finallyBody.promisify(), [ "then" ], [ terms.closure([], terms.statements([ resultStatement ])) ]) ]));
            };
            return terms.methodCall(body, [ "then" ], [ finallyBlock(), finallyBlock({
                throwResult: true
            }) ]).alreadyPromise();
        };
        return tryExpression = function(body, gen3_options) {
            var catchBody, catchParameter, finallyBody;
            catchBody = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "catchBody") && gen3_options.catchBody !== void 0 ? gen3_options.catchBody : void 0;
            catchParameter = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "catchParameter") && gen3_options.catchParameter !== void 0 ? gen3_options.catchParameter : void 0;
            finallyBody = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "finallyBody") && gen3_options.finallyBody !== void 0 ? gen3_options.finallyBody : void 0;
            if (body.returnsPromise || catchBody && catchBody.returnsPromise || finallyBody && finallyBody.returnsPromise) {
                if (catchBody) {
                    if (finallyBody) {
                        return terms.resolve(finallyClause(catchClause(body.promisify(), catchParameter, catchBody), finallyBody));
                    } else {
                        return terms.resolve(catchClause(body.promisify(), catchParameter, catchBody));
                    }
                } else if (finallyBody) {
                    return terms.resolve(finallyClause(body.promisify(), finallyBody));
                } else {
                    return terms.resolve(body);
                }
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