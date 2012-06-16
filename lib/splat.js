((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function() {
                var self;
                self = this;
                return self.isSplat = true;
            },
            parameter: function() {
                var self;
                self = this;
                return self;
            }
        });
    };
})).call(this);