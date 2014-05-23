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
                    return self._resolve = terms.methodCall(terms.promise(), [ "resolve" ], [ term ]);
                } else {
                    return self._resolve = term;
                }
            },
            generate: function(scope) {
                var self = this;
                return self._resolve.generate(scope);
            },
            makeAsyncCallWithCallback: function(onFulfilled, onRejected) {
                var self = this;
                var args;
                args = [];
                if (onFulfilled && onFulfilled !== terms.onFulfilledFunction) {
                    args.push(onFulfilled);
                }
                if (args.length > 0) {
                    self._resolve = terms.methodCall(self._resolve, [ "then" ], args);
                }
                return self;
            },
            rewriteResultTermInto: function(returnTerm, gen1_options) {
                var self = this;
                var async;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                return returnTerm(self._resolve);
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