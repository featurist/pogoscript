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
                return self.isContinue = true;
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self;
                self = this;
                return buffer.write("continue;");
            },
            returnResult: function() {
                var self;
                self = this;
                return self;
            }
        });
    };
})).call(this);