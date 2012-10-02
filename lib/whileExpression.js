((function() {
    var self, asyncControl;
    self = this;
    asyncControl = require("./asyncControl");
    module.exports = function(terms) {
        var self, whileExpressionTerm, whileExpression;
        self = this;
        whileExpressionTerm = terms.term({
            constructor: function(condition, statements) {
                var self;
                self = this;
                self.isWhile = true;
                self.condition = condition;
                return self.statements = statements;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                buffer.write("while(");
                self.condition.generateJavaScript(buffer, scope);
                buffer.write("){");
                self.statements.generateJavaScriptStatements(buffer, scope);
                return buffer.write("}");
            },
            generateJavaScriptStatement: function() {
                var args, self, gen1_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self;
                self = this;
                return self;
            }
        });
        return whileExpression = function(condition, statements) {
            var conditionStatements, asyncWhileFunction;
            conditionStatements = terms.asyncStatements([ condition ]);
            if (statements.isAsync || conditionStatements.isAsync) {
                asyncWhileFunction = terms.moduleConstants.defineAs([ "async", "while" ], terms.javascript(asyncControl.while.toString()));
                return terms.functionCall(asyncWhileFunction, [ terms.argumentUtils.asyncifyBody(conditionStatements), terms.argumentUtils.asyncifyBody(statements) ], {
                    async: true
                });
            } else {
                return whileExpressionTerm(condition, statements);
            }
        };
    };
})).call(this);