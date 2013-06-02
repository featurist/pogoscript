(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isFutureArgument = true;
            },
            arguments: function() {
                var self = this;
                return [];
            }
        });
    };
}).call(this);