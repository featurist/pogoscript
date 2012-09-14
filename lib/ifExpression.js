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
            constructor: function(cases, _else) {
                var self;
                self = this;
                self.isIfExpression = true;
                self.cases = cases;
                return self._else = _else;
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self;
                self = this;
                codegenUtils.writeToBufferWithDelimiter(self.cases, "else ", buffer, function(case_) {
                    buffer.write("if(");
                    case_[0].generateJavaScript(buffer, scope);
                    buffer.write("){");
                    case_[1].generateJavaScriptStatements(buffer, scope);
                    return buffer.write("}");
                });
                if (self._else) {
                    buffer.write("else{");
                    self._else.generateJavaScriptStatements(buffer, scope);
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
                    _case[1].rewriteResultTermInto(returnTerm);
                }
                if (self._else) {
                    self._else.rewriteResultTermInto(returnTerm);
                }
                return self;
            }
        });
        return ifExpression = function(cases, _else) {
            var anyAsync, asyncIfFunction;
            anyAsync = _.any(cases, function(_case) {
                return _case[1].isAsync;
            });
            if (anyAsync) {
                asyncIfFunction = terms.moduleConstants.defineAs([ "async", "if" ], terms.javascript(asyncControl.if.toString()));
                debugger
                return terms.functionCall(asyncIfFunction, [ cases[0][0], terms.closure([], cases[0][1]) ], void 0, {
                    async: true
                });
            } else {
                return ifExpressionTerm(cases, _else);
            }
        };
    };
})).call(this);