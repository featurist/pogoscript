((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(source) {
                var self;
                self = this;
                self.isJavaScript = true;
                return self.source = source;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                return buffer.write(self.source);
            }
        });
    };
})).call(this);