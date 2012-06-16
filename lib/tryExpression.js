((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(body, catchBody, finallyBody) {
                var self;
                self = this;
                self.isTryStatement = true;
                self.body = body;
                self.catchBody = catchBody;
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
                    self.catchBody.parameters[0].generateJavaScript(buffer, scope);
                    buffer.write("){");
                    if (returnStatements) {
                        self.catchBody.body.generateJavaScriptStatementsReturn(buffer, scope);
                    } else {
                        self.catchBody.body.generateJavaScriptStatements(buffer, scope);
                    }
                    buffer.write("}");
                }
                if (self.finallyBody) {
                    buffer.write("finally{");
                    self.finallyBody.generateJavaScriptStatements(buffer, scope);
                    return buffer.write("}");
                }
            },
            generateJavaScriptReturn: function(buffer, scope) {
                var self;
                self = this;
                return self.generateJavaScriptStatement(buffer, scope, true);
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
            }
        });
    };
})).call(this);