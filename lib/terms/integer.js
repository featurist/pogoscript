(function() {
    var self = this;
    module.exports = function(cg) {
        var self = this;
        return cg.term({
            constructor: function(value) {
                var self = this;
                self.isInteger = true;
                return self.integer = value;
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.integer.toString());
            }
        });
    };
}).call(this);