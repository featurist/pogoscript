(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(name) {
                var self = this;
                self.name = name;
                self.isVariable = true;
                return self.genVar = void 0;
            },
            dontClone: true,
            generatedName: function(scope) {
                var self = this;
                if (!self.genVar) {
                    self.genVar = scope.generateVariable(codegenUtils.concatName(self.name));
                }
                return self.genVar;
            },
            canonicalName: function(scope) {
                var self = this;
                return self.generatedName(scope);
            },
            displayName: function() {
                var self = this;
                return self.name;
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.generatedName(scope));
            },
            generateTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generate.apply(gen1_o, args);
            }
        });
    };
}).call(this);