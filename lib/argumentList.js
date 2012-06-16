((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(args) {
                var self;
                self = this;
                self.isArgumentList = true;
                return self.args = args;
            },
            arguments: function() {
                var self;
                self = this;
                return self.args;
            }
        });
    };
})).call(this);