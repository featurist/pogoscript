((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(cg) {
        var self;
        self = this;
        return cg.term({
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
                return self.cg.functionCall(self.cg.subExpression(self.cg.block([], self.cg.statements([ self ]))), []).generateJavaScript(buffer, scope);
            },
            returnResult: function(returnTerm) {
                var self, gen1_items, gen2_i, _case;
                self = this;
                gen1_items = self.cases;
                for (gen2_i = 0; gen2_i < gen1_items.length; gen2_i++) {
                    _case = gen1_items[gen2_i];
                    _case[1].returnLastStatement(returnTerm);
                }
                if (self._else) {
                    self._else.returnLastStatement(returnTerm);
                }
                return self;
            }
        });
    };
})).call(this);