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
            if (!body.containsContinuation()) {
                body.rewriteResultTermInto(function(term) {
                    if (!term.originallyAsync) {
                        return terms.returnStatement(terms.functionCall(terms.continuationFunction, [ term ]), {
                            implicit: true
                        });
                    } else {
                        return term;
                    }
                }, {
                    async: true
                });
            }
            return terms.closure([ resultVariable ], body, {
                returnLastStatement: false
            });
        };
    };
}).call(this);