(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var resolve;
        resolve = terms.term({
            constructor: function(term) {
                var self = this;
                var resolve;
                self.isResolve = true;
                self.term = term;
                resolve = terms.methodCall(terms.promise(), [ "resolve" ], [ self.term ]);
                self._methodCall = terms.methodCall(resolve, [ "then" ], []);
                return self._onFulfilled = terms.functionCall(terms.onFulfilledFunction, [ self._methodCall ]);
            },
            generate: function(scope) {
                var self = this;
                return self._onFulfilled.generate(scope);
            },
            makeAsyncCallWithCallback: function(onFulfilled, onRejected) {
                var self = this;
                var args;
                args = [ onFulfilled || terms.onFulfilledFunction ];
                self._methodCall.methodArguments = args;
                return self;
            }
        });
        return function(term) {
            var asyncResult;
            asyncResult = terms.asyncResult();
            return terms.subStatements([ terms.definition(asyncResult, resolve(term), {
                async: true
            }), asyncResult ]);
        };
    };
}).call(this);