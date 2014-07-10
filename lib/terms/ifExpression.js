(function() {
    var self = this;
    var codegenUtils, _, asyncControl;
    codegenUtils = require("./codegenUtils");
    _ = require("underscore");
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var ifExpressionTerm, ifExpression;
        ifExpressionTerm = terms.term({
            constructor: function(cases, elseBody) {
                var self = this;
                self.isIfExpression = true;
                self.cases = cases;
                return self.elseBody = elseBody;
            },
            generateStatement: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    codegenUtils.writeToBufferWithDelimiter(self.cases, "else ", buffer, function(case_) {
                        buffer.write("if(");
                        buffer.write(case_.condition.generate(scope));
                        buffer.write("){");
                        buffer.write(case_.body.generateStatements(scope));
                        return buffer.write("}");
                    });
                    if (self.elseBody) {
                        buffer.write("else{");
                        buffer.write(self.elseBody.generateStatements(scope));
                        return buffer.write("}");
                    }
                });
            },
            generate: function(scope) {
                var self = this;
                self.rewriteResultTermInto(function(term) {
                    return terms.returnStatement(term);
                });
                return self.code("(function(){", self.generateStatement(scope), "})()");
            },
            rewriteResultTermInto: function(returnTerm, gen1_options) {
                var self = this;
                var async;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                var gen2_items, gen3_i, _case;
                gen2_items = self.cases;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    _case = gen2_items[gen3_i];
                    _case.body.rewriteResultTermInto(returnTerm);
                }
                if (self.elseBody) {
                    self.elseBody.rewriteResultTermInto(returnTerm);
                } else if (async) {
                    self.elseBody = terms.statements([ terms.functionCall(terms.continuationFunction, []) ]);
                }
                return self;
            }
        });
        return ifExpression = function(cases, elseBody, gen4_options) {
            var isPromise;
            isPromise = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "isPromise") && gen4_options.isPromise !== void 0 ? gen4_options.isPromise : false;
            var anyAsyncCases, splitIfElseIf;
            anyAsyncCases = _.any(cases, function(_case) {
                return _case.body.returnsPromise || _case.condition.containsAsync();
            });
            if (!isPromise && (anyAsyncCases || elseBody && elseBody.returnsPromise)) {
                splitIfElseIf = function(cases, elseBody) {
                    var casesTail;
                    casesTail = cases.slice(1);
                    if (casesTail.length > 0) {
                        return ifExpressionTerm([ cases[0] ], terms.asyncStatements([ splitIfElseIf(casesTail, elseBody) ]));
                    } else {
                        return ifExpressionTerm(cases, elseBody);
                    }
                };
                return terms.resolve(splitIfElseIf(cases, elseBody));
            } else {
                return ifExpressionTerm(cases, elseBody);
            }
        };
    };
}).call(this);