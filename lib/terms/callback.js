(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isCallback = true;
            },
            parameter: function() {
                var self = this;
                return self;
            },
            generate: function(scope) {
                var self = this;
                return terms.callbackFunction.generate(scope);
            }
        });
    };
}).call(this);