((function() {
    var self;
    self = this;
    module.exports = function(cg) {
        var self;
        self = this;
        return cg.term({
            constructor: function(value) {
                var self;
                self = this;
                self.isInteger = true;
                return self.integer = value;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                return buffer.write(self.integer.toString());
            }
        });
    };
})).call(this);