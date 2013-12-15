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
            generate: function(scope) {
                var self = this;
                var options;
                options = self.options || "";
                return self.code("/" + self.pattern.replace(/\//g, "\\/") + "/" + options);
            }
        });
    };
}).call(this);