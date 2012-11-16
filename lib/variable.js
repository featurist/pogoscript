(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var variableTerm, variable;
        variableTerm = terms.term({
            constructor: function(name) {
                var self = this;
                self.variable = name;
                return self.isVariable = true;
            },
            variableName: function() {
                var self = this;
                return codegenUtils.concatName(self.variable, {
                    escape: true
                });
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(this.variableName());
            },
            generateJavaScriptTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            },
            hashEntryField: function() {
                var self = this;
                return self.variable;
            },
            generateJavaScriptParameter: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            parameter: function() {
                var self = this;
                return self;
            },
            expandMacro: function() {
                var self = this;
                var name, macro;
                name = self.variable;
                macro = self.cg.macros.findMacro(name);
                if (macro) {
                    return macro(name);
                }
            }
        });
        return variable = function(name, gen3_options) {
            var couldBeMacro;
            couldBeMacro = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "couldBeMacro") && gen3_options.couldBeMacro !== void 0 ? gen3_options.couldBeMacro : true;
            var macro;
            if (couldBeMacro) {
                macro = terms.macros.findMacro(name);
                if (macro) {
                    return macro(name);
                }
            }
            return variableTerm(name);
        };
    };
}).call(this);