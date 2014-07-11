(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var resolve, createResolve;
        resolve = terms.term({
            constructor: function(term) {
                var self = this;
                self.isResolve = true;
                return self.resolve = term.promisify();
            },
            makeAsyncCallWithCallback: function(onFulfilled, onRejected) {
                var self = this;
                var args;
                args = [];
                if (onFulfilled && onFulfilled !== terms.onFulfilledFunction) {
                    args.push(onFulfilled);
                }
                if (args.length > 0) {
                    return terms.methodCall(self.resolve, [ "then" ], args);
                } else {
                    return self.resolve;
                }
            }
        });
        return createResolve = function(term, gen1_options) {
            var alreadyPromise;
            alreadyPromise = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "alreadyPromise") && gen1_options.alreadyPromise !== void 0 ? gen1_options.alreadyPromise : false;
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