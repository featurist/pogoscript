(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var whileExpressionTerm, whileExpression;
        whileExpressionTerm = terms.term({
            constructor: function(condition, statements) {
                var self = this;
                self.isWhile = true;
                self.condition = condition;
                return self.statements = statements;
            },
            generate: function(scope) {
                var self = this;
                return self.code("while(", self.condition.generate(scope), "){", self.statements.generateStatements(scope), "}");
            },
            generateStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generate.apply(gen1_o, args);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return void 0;
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
}).call(this);