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
                var location;
                location = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "location") && gen1_options.location !== void 0 ? gen1_options.location : void 0;
                self.variable = name;
                self.isVariable = true;
                return self.setLocation(location);
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(this.canonicalName());
            },
            generateJavaScriptTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            hashEntryField: function() {
                var self = this;
                return self.variable;
            },
            generateJavaScriptParameter: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen3_o;
                gen3_o = self;
                return gen3_o.generateJavaScript.apply(gen3_o, args);
            },
            parameter: function() {
                var self = this;
                return self;
            }
        });
        return variable = function(name, gen4_options) {
            var couldBeMacro, location;
            couldBeMacro = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "couldBeMacro") && gen4_options.couldBeMacro !== void 0 ? gen4_options.couldBeMacro : true;
            location = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "location") && gen4_options.location !== void 0 ? gen4_options.location : void 0;
            var v, macro;
            v = variableTerm(name, {
                location: location
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