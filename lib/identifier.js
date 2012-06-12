((function() {
    var self;
    self = this;
    module.exports = function(cg) {
        var self;
        self = this;
        return cg.term({
            constructor: function(name) {
                var self;
                self = this;
                self.isIdentifier = true;
                return self.identifier = name;
            },
            arguments: function() {
                var self;
                self = this;
                return void 0;
            }
        });
    };
})).call(this);