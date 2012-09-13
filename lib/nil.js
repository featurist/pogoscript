((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function() {
                var self;
                self = this;
                return self.isNil = true;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                return terms.javascript("void 0").generateJavaScript(buffer, scope);
            }
        });
    };
})).call(this);