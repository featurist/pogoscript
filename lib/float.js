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
                self.isFloat = true;
                return self.float = value;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                return buffer.write(self.float.toString());
            }
        });
    };
})).call(this);