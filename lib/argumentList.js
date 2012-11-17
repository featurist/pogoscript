(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(args) {
                var self = this;
                self.isArgumentList = true;
                return self.args = args;
            },
            arguments: function() {
                var self = this;
                return self.args;
            }
        });
    };
}).call(this);