(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var asyncCallback;
        return asyncCallback = function(body, gen1_options) {
            var resultVariable;
            resultVariable = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            var errorVariable, catchErrorVariable;
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
}).call(this);