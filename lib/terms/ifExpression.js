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
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                codegenUtils.writeToBufferWithDelimiter(self.cases, "else ", buffer, function(case_) {
                    buffer.write("if(");
                    case_.condition.generateJavaScript(buffer, scope);
                    buffer.write("){");
                    case_.body.generateJavaScriptStatements(buffer, scope);
                    return buffer.write("}");
                });
                if (self.elseBody) {
                    buffer.write("else{");
                    self.elseBody.generateJavaScriptStatements(buffer, scope);
                    return buffer.write("}");
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                self.rewriteResultTermInto(function(term) {
                    return terms.returnStatement(term);
                });
                buffer.write("(function(){");
                self.generateJavaScriptStatement(buffer, scope);
                return buffer.write("})()");
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
                    self.elseBody = terms.statements([ terms.functionCall(terms.callbackFunction, []) ]);
                }
                return self;
            }
        });
        return ifExpression = function(cases, elseBody) {
            var anyAsyncCases, caseForConditionAndBody, casesList, asyncIfElseIfElseFunction, asyncIfElseFunction, asyncIfFunction;
            anyAsyncCases = _.any(cases, function(_case) {
                return _case.body.isAsync;
            });
            if (anyAsyncCases || elseBody && elseBody.isAsync) {
                if (cases.length > 1) {
                    caseForConditionAndBody = function(condition, body) {
                        return terms.hash([ terms.hashEntry([ "condition" ], condition), terms.hashEntry([ "body" ], terms.argumentUtils.asyncifyBody(body)) ]);
                    };
                    casesList = _.map(cases, function(_case) {
                        return caseForConditionAndBody(_case.condition, _case.body);
                    });
                    if (elseBody) {
                        casesList.push(caseForConditionAndBody(terms.boolean(true), elseBody));
                    }
                    asyncIfElseIfElseFunction = terms.moduleConstants.defineAs([ "async", "if", "else", "if", "else" ], terms.javascript(asyncControl.ifElseIfElse.toString()));
                    return terms.functionCall(asyncIfElseIfElseFunction, [ terms.list(casesList) ], {
                        async: true
                    });
                } else if (elseBody) {
                    asyncIfElseFunction = terms.moduleConstants.defineAs([ "async", "if", "else" ], terms.javascript(asyncControl.ifElse.toString()));
                    return terms.functionCall(asyncIfElseFunction, [ cases[0].condition, terms.argumentUtils.asyncifyBody(cases[0].body), terms.argumentUtils.asyncifyBody(elseBody) ], {
                        async: true
                    });
                } else {
                    asyncIfFunction = terms.moduleConstants.defineAs([ "async", "if" ], terms.javascript(asyncControl.if.toString()));
                    return terms.functionCall(asyncIfFunction, [ cases[0].condition, terms.argumentUtils.asyncifyBody(cases[0].body) ], {
                        async: true
                    });
                }
            } else {
                return ifExpressionTerm(cases, elseBody);
            }
        };
    };
}).call(this);