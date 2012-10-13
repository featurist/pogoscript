((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, closureParameters;
        self = this;
        return closureParameters = function(parameters) {
            return terms.normalParameters(parameters);
        };
    };
})).call(this);