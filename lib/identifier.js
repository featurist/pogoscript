(function() {
    var self = this;
    module.exports = function(cg) {
        var self = this;
        return cg.term({
            constructor: function(name) {
                var self = this;
                self.isIdentifier = true;
                return self.identifier = name;
            },
            arguments: function() {
                var self = this;
                return void 0;
            }
        });
    };
}).call(this);