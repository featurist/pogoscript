((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(parameters) {
                var self;
                self = this;
                return self.parameters = parameters;
            }
        });
    };
})).call(this);