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
                self.boolean = value;
                return self.isBoolean = true;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                if (self.boolean) {
                    return buffer.write("true");
                } else {
                    return buffer.write("false");
                }
            }
        });
    };
})).call(this);