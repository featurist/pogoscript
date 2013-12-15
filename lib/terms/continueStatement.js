(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isContinue = true;
            },
            generateStatement: function(scope) {
                var self = this;
                return self.code("continue;");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);