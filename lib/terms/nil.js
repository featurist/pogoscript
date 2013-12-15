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
                return self.code(terms.javascript("void 0").generate(scope));
            }
        });
    };
}).call(this);