(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return function(term) {
            var promisifyFunction;
            promisifyFunction = terms.moduleConstants.defineAs([ "promisify" ], terms.javascript(asyncControl.promisify.toString()));
            return terms.functionCall(promisifyFunction, [ terms.closure([ terms.callbackFunction ], terms.statements([ term ])) ]);
        };
    };
}).call(this);