((function() {
    var self, codegenUtils, _, asyncControl;
    self = this;
    codegenUtils = require("./codegenUtils");
    _ = require("underscore");
    asyncControl = require("./asyncControl");
    module.exports = function(terms) {
        var self, ifExpressionTerm, ifExpression;
        self = this;
        ifExpressionTerm = terms.term({
            constructor: function(cases, elseBody) {
                var self;
                self = this;
                self.isIfExpression = true;
                self.cases = cases;
                return self.elseBody = elseBody;
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self;
                self = this;
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
                var self;
                self = this;
                self.rewriteResultTermInto(function(term) {
                    return terms.returnStatement(term);
                });
                return terms.functionCall(terms.subExpression(terms.block([], terms.statements([ self ]))), []).generateJavaScript(buffer, scope);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self, gen1_items, gen2_i, _case;
                self = this;
                gen1_items = self.cases;
                for (gen2_i = 0; gen2_i < gen1_items.length; gen2_i++) {
                    _case = gen1_items[gen2_i];
                    _case.body.rewriteResultTermInto(returnTerm);
                }
                if (self.elseBody) {
                    self.elseBody.rewriteResultTermInto(returnTerm);
                }
                return self;
            }
        });
        return ifExpression = function(cases, elseBody) {
            var anyAsync, asyncIfFunction;
            anyAsync = _.any(cases, function(_case) {
                return _case.body.isAsync;
            });
            if (anyAsync) {
                asyncIfFunction = terms.moduleConstants.defineAs([ "async", "if" ], terms.javascript(asyncControl.if.toString()));
                return terms.functionCall(asyncIfFunction, [ cases[0].condition, terms.closure([], cases[0].body) ], {
                    async: true
                });
            } else {
                return ifExpressionTerm(cases, elseBody);
            }
        };
    };
})).call(this);