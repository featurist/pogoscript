(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(term) {
                var self = this;
                self.isPromisify = true;
                terms.promise();
                self.promisifyFunction = terms.moduleConstants.defineAs([ "promisify" ], terms.javascript(asyncControl.promisify.toString()));
                return self.term = term;
            },
            generate: function(scope) {
                var self = this;
                return terms.functionCall(self.promisifyFunction, [ terms.closure([ terms.callbackFunction ], terms.statements([ self.term ])) ]).generate(scope);
            },
            promisify: function() {
                var self = this;
                return self;
            }
        });
    };
}).call(this);