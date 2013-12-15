(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var newOperatorTerm, newOperator;
        newOperatorTerm = terms.term({
            constructor: function(fn) {
                var self = this;
                self.isNewOperator = true;
                return self.functionCall = fn;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return self.codeIntoBuffer(buffer, function(buffer) {
                    buffer.write("new ");
                    if (self.functionCall.isVariable) {
                        return buffer.write(terms.functionCall(self.functionCall, []).generate(scope));
                    } else if (self.functionCall.isFunctionCall && self.functionCall.hasSplatArguments()) {
                        return buffer.write(self.cg.block([], self.cg.statements([ self.functionCall ]), {
                            returnLastStatement: false
                        }).generate(scope));
                    } else {
                        return buffer.write(self.functionCall.generate(scope));
                    }
                });
            }
        });
        return newOperator = function(fn) {
            var statements, constructor, constructorVariable;
            if (fn.isFunctionCall && fn.hasSplatArguments()) {
                statements = [];
                fn.passThisToApply = true;
                constructor = terms.block([], terms.statements([ fn ]), {
                    returnLastStatement: false
                });
                constructorVariable = terms.generatedVariable([ "c" ]);
                statements.push(terms.definition(constructorVariable, constructor));
                statements.push(terms.definition(terms.fieldReference(constructorVariable, [ "prototype" ]), terms.fieldReference(fn.function, [ "prototype" ])));
                statements.push(terms.newOperator(constructorVariable));
                return terms.subStatements(statements);
            } else {
                return newOperatorTerm(fn);
            }
        };
    };
}).call(this);