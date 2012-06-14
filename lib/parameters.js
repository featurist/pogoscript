((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(parms) {
                var self;
                self = this;
                self.isParameters = true;
                return self.parameters = parms;
            },
            arguments: function() {
                var self;
                self = this;
                return [];
            }
        });
    };
})).call(this);