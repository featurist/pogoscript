(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(source) {
                var self = this;
                self.isJavaScript = true;
                return self.source = source;
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.source);
            }
        });
    };
}).call(this);