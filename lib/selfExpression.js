((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, selfExpression;
        self = this;
        return selfExpression = function() {
            return terms.variable([ "self" ], {
                shadow: true
            });
        };
    };
})).call(this);