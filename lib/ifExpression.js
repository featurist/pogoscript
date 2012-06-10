((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    exports.ifExpression = function(cases, _else) {
        var self;
        self = this;
        return self.term(function() {
            var self;
            self = this;
            self.isIfExpression = true;
            self.cases = cases;
            self._else = _else;
            self.generateJavaScriptStatement = function(buffer, scope, generateReturnStatements) {
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
            };
            self.generateJavaScript = function(buffer, scope) {
                var self;
                self = this;
                return self.cg.functionCall(self.cg.subExpression(self.cg.block([], self.cg.statements([ self ]))), []).generateJavaScript(buffer, scope);
            };
            return self.generateJavaScriptReturn = function(buffer, scope) {
                var self;
                self = this;
                return self.generateJavaScriptStatement(buffer, scope, true);
            };
        });
    };
})).call(this);