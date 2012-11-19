(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isAsyncArgument = true;
            },
            arguments: function() {
                var self = this;
                return [];
            }
        });
    };
}).call(this);