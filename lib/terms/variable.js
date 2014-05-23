(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var variableTerm, variable;
        variableTerm = terms.term({
            constructor: function(name, gen1_options) {
                var self = this;
                var location, tag;
                location = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "location") && gen1_options.location !== void 0 ? gen1_options.location : void 0;
                tag = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "tag") && gen1_options.tag !== void 0 ? gen1_options.tag : void 0;
                self.variable = name;
                self.isVariable = true;
                self.setLocation(location);
                return self.tag = tag;
            },
            declare: function(scope) {
                var self = this;
                if (self.tag) {
                    return scope.defineWithTag(self.canonicalName(), self.tag);
                } else {
                    return scope.define(self.canonicalName());
                }
            },
            canonicalName: function() {
                var self = this;
                return codegenUtils.concatName(self.variable, {
                    escape: true
                });
            },
            displayName: function() {
                var self = this;
                return self.variable.join(" ");
            },
            generate: function(scope) {
                var self = this;
                if (self.tag) {
                    return self.code(scope.findTag(self.tag));
                } else {
                    return self.code(self.canonicalName());
                }
            },
            generateTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generate.apply(gen2_o, args);
            },
            hashEntryField: function() {
                var self = this;
                return self.variable;
            },
            parameter: function() {
                var self = this;
                return self;
            }
        });
        return variable = function(name, gen3_options) {
            var couldBeMacro, location, tag;
            couldBeMacro = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "couldBeMacro") && gen3_options.couldBeMacro !== void 0 ? gen3_options.couldBeMacro : true;
            location = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "location") && gen3_options.location !== void 0 ? gen3_options.location : void 0;
            tag = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "tag") && gen3_options.tag !== void 0 ? gen3_options.tag : void 0;
            var v, macro;
            v = variableTerm(name, {
                location: location,
                tag: tag
            });
            if (couldBeMacro) {
                macro = terms.macros.findMacro(name);
                if (macro) {
                    return macro(v, name);
                }
            }
            return v;
        };
    };
}).call(this);