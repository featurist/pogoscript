(function() {
    var self = this;
    module.exports = function(cg) {
        var self = this;
        return cg.term({
            constructor: function(value) {
                var self = this;
                self.boolean = value;
                return self.isBoolean = true;
            },
            generate: function(scope) {
                var self = this;
                return self.code(function() {
                    if (self.boolean) {
                        return "true";
                    } else {
                        return "false";
                    }
                }());
            }
        });
    };
}).call(this);