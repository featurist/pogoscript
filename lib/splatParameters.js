(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(parameters) {
                var self = this;
                return self.parameters = parameters;
            }
        });
    };
}).call(this);