((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(patternOptions) {
                var self;
                self = this;
                self.isRegExp = true;
                self.pattern = patternOptions.pattern;
                return self.options = patternOptions.options;
            },
            generateJavaScript: function(buffer, scope) {
                var self, options;
                self = this;
                options = function() {
                    if (self.options) {
                        return "/" + self.options;
                    } else {
                        return "/";
                    }
                }();
                return buffer.write("/" + this.pattern.replace(/\//g, "\\/") + options);
            }
        });
    };
})).call(this);