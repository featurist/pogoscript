(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(parms) {
                var self = this;
                self.isParameters = true;
                return self.parameters = parms;
            },
            arguments: function() {
                var self = this;
                return [];
            }
        });
    };
}).call(this);