(function() {
    var self = this;
    module.exports = function(cg) {
        var self = this;
        return cg.term({
            constructor: function(value) {
                var self = this;
                self.isFloat = true;
                return self.float = value;
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.float.toString());
            }
        });
    };
}).call(this);