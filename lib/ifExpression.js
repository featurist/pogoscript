((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(cg) {
        var self, ifExpressionTerm, ifExpression;
        self = this;
        ifExpressionTerm = classExtending(cg.termClass, {
            constructor: function(cases, _else) {
                var self;
                self = this;
                self.isIfExpression = true;
                self.cases = cases;
                return self._else = _else;
            },
            generateJavaScriptStatement: function(buffer, scope, generateReturnStatements) {
                var self;
                self = this;
                codegenUtils.writeToBufferWithDelimiter(self.cases, "else ", buffer, function(case_) {
                    buffer.write("if(");
                    case_[0].generateJavaScript(buffer, scope);
                    buffer.write("){");
                    if (generateReturnStatements) {
                        case_[1].generateJavaScriptStatementsReturn(buffer, scope);
                    } else {
                        case_[1].generateJavaScriptStatements(buffer, scope);
                    }
                    return buffer.write("}");
                });
                if (self._else) {
                    buffer.write("else{");
                    if (generateReturnStatements) {
                        self._else.generateJavaScriptStatementsReturn(buffer, scope);
                    } else {
                        self._else.generateJavaScriptStatements(buffer, scope);
                    }
                    return buffer.write("}");
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                return self.cg.functionCall(self.cg.subExpression(self.cg.block([], self.cg.statements([ self ]))), []).generateJavaScript(buffer, scope);
            },
            generateJavaScriptReturn: function(buffer, scope) {
                var self;
                self = this;
                return self.generateJavaScriptStatement(buffer, scope, true);
            }
        });
        return ifExpression = function() {
            var args, gen1_c;
            args = Array.prototype.slice.call(arguments, 0, arguments.length);
            gen1_c = function() {
                ifExpressionTerm.apply(this, args);
            };
            gen1_c.prototype = ifExpressionTerm.prototype;
            return new gen1_c;
        };
    };
})).call(this);