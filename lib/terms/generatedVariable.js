(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(name, gen1_options) {
                var self = this;
                var tag;
                tag = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "tag") && gen1_options.tag !== void 0 ? gen1_options.tag : void 0;
                self.name = name;
                self.isVariable = true;
                self.genVar = void 0;
                return self.tag = tag;
            },
            dontClone: true,
            declare: function(scope) {
                var self = this;
                if (self.tag) {
                    return scope.defineWithTag(self.canonicalName(scope), self.tag);
                } else {
                    return scope.define(self.canonicalName(scope));
                }
            },
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
                var variable;
                if (self.tag) {
                    variable = scope.findTag(self.tag);
                    if (variable) {
                        return self.code(variable);
                    } else {
                        return self.code(self.canonicalName(scope));
                    }
                } else {
                    return self.code(self.canonicalName(scope));
                }
            },
            generateTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generate.apply(gen2_o, args);
            }
        });
    };
}).call(this);