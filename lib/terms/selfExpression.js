(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var selfExpression;
        return selfExpression = function() {
            return terms.variable([ "self" ], {
                shadow: true
            });
        };
    };
}).call(this);