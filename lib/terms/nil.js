(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isNil = true;
            },
            generate: function(scope) {
                var self = this;
                return self.code("void 0");
            }
        });
    };
}).call(this);