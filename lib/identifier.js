((function() {
    var self;
    self = this;
    module.exports = function(cg) {
        var self, identifier;
        self = this;
        identifier = classExtending(cg.termClass, {
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
        return function() {
            var args, gen1_c;
            args = Array.prototype.slice.call(arguments, 0, arguments.length);
            gen1_c = function() {
                identifier.apply(this, args);
            };
            gen1_c.prototype = identifier.prototype;
            return new gen1_c;
        };
    };
})).call(this);