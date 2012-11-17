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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(self.source);
            }
        });
    };
}).call(this);