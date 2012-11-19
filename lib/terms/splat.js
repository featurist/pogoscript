(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isSplat = true;
            },
            parameter: function() {
                var self = this;
                return self;
            }
        });
    };
}).call(this);