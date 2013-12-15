(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(patternOptions) {
                var self = this;
                self.isRegExp = true;
                self.pattern = patternOptions.pattern;
                return self.options = patternOptions.options;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return self.codeIntoBuffer(buffer, function(buffer) {
                    var options;
                    options = function() {
                        if (self.options) {
                            return "/" + self.options;
                        } else {
                            return "/";
                        }
                    }();
                    return buffer.write("/" + self.pattern.replace(/\//g, "\\/") + options);
                });
            }
        });
    };
}).call(this);