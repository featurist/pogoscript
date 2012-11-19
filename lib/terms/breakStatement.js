(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isBreak = true;
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                return buffer.write("break;");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);