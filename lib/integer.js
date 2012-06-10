((function() {
    var self;
    self = this;
    module.exports = function(cg) {
        var self, integer;
        self = this;
        integer = classExtending(cg.termClass, {
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
        return function() {
            var args, gen1_c;
            args = Array.prototype.slice.call(arguments, 0, arguments.length);
            gen1_c = function() {
                integer.apply(this, args);
            };
            gen1_c.prototype = integer.prototype;
            return new gen1_c;
        };
    };
})).call(this);