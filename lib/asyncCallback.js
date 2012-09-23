((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, asyncCallback;
        self = this;
        return asyncCallback = function(body, gen1_options) {
            var resultVariable, errorVariable, catchErrorVariable;
            resultVariable = gen1_options && gen1_options.hasOwnProperty("resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            errorVariable = terms.generatedVariable([ "error" ]);
            catchErrorVariable = terms.generatedVariable([ "exception" ]);
            body.rewriteResultTermInto(function(term) {
                if (!term.originallyAsync) {
                    return terms.functionCall(terms.callbackFunction, [ terms.nil(), term ]);
                } else {
                    return term;
                }
            });
            return terms.closure([ errorVariable, resultVariable ], terms.statements([ terms.ifExpression([ {
                condition: errorVariable,
                body: terms.statements([ terms.functionCall(terms.callbackFunction, [ errorVariable ]) ])
            } ], terms.statements([ terms.tryExpression(body, {
                catchParameter: catchErrorVariable,
                catchBody: terms.statements([ terms.functionCall(terms.callbackFunction, [ catchErrorVariable ]) ])
            }) ])) ]), {
                returnLastStatement: false
            });
        };
    };
})).call(this);