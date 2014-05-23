(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var resolve;
        resolve = terms.term({
            constructor: function(term) {
                var self = this;
                self.isResolve = true;
                self.term = term;
                if (!term.isNewPromise) {
                    self._resolve = terms.methodCall(terms.promise(), [ "resolve" ], [ term ]);
                } else {
                    self._resolve = term;
                }
                return self._onFulfilled = terms.functionCall(terms.onFulfilledFunction, [ self._resolve ]);
            },
            generate: function(scope) {
                var self = this;
                return self._onFulfilled.generate(scope);
            },
            makeAsyncCallWithCallback: function(onFulfilled, onRejected) {
                var self = this;
                var args;
                args = [];
                if (onFulfilled && onFulfilled !== terms.onFulfilledFunction) {
                    args.push(onFulfilled);
                }
                if (args.length > 0) {
                    self._then = terms.methodCall(self._resolve, [ "then" ], args);
                    self._onFulfilled = terms.functionCall(terms.onFulfilledFunction, [ self._then ]);
                }
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