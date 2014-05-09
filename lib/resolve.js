(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return function(term) {
            return terms.functionCall(terms.resolveFunction, [ term ], {
                async: true
            });
        };
    };
}).call(this);