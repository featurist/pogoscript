(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var resolve, createResolve;
        resolve = terms.term({
            constructor: function(term, gen1_options) {
                var self = this;
                var alreadyPromise;
                alreadyPromise = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "alreadyPromise") && gen1_options.alreadyPromise !== void 0 ? gen1_options.alreadyPromise : false;
                self.isResolve = true;
                self.term = term;
                return self._resolve = function() {
                    if (alreadyPromise) {
                        return term;
                    } else {
                        return term.promisify();
                    }
                }();
            },
            makeAsyncCallWithCallback: function(onFulfilled, onRejected) {
                var self = this;
                var args;
                args = [];
                if (onFulfilled && onFulfilled !== terms.onFulfilledFunction) {
                    args.push(onFulfilled);
                }
                if (args.length > 0) {
                    return terms.methodCall(self._resolve, [ "then" ], args);
                } else {
                    return self._resolve;
                }
            }
        });
        return createResolve = function(term, gen2_options) {
            var alreadyPromise;
            alreadyPromise = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "alreadyPromise") && gen2_options.alreadyPromise !== void 0 ? gen2_options.alreadyPromise : false;
            var asyncResult;
            asyncResult = terms.asyncResult();
            return terms.subStatements([ terms.definition(asyncResult, resolve(term, {
                alreadyPromise: alreadyPromise
            }), {
                async: true
            }), asyncResult ]);
        };
    };
}).call(this);