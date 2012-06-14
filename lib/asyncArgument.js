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
                return self.isAsyncArgument = true;
            },
            arguments: function() {
                var self;
                self = this;
                return [];
            }
        });
    };
})).call(this);