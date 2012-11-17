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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(self.float.toString());
            }
        });
    };
}).call(this);