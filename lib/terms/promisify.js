(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        return function(term) {
            return terms.newPromise({
                statements: terms.statements([ term ], {
                    returnsPromise: true
                })
            });
        };
    };
}).call(this);