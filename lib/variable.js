((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self, variableTerm, variable;
        self = this;
        variableTerm = terms.term({
            constructor: function(name) {
                var self;
                self = this;
                self.variable = name;
                return self.isVariable = true;
            },
            variableName: function() {
                var self;
                self = this;
                return codegenUtils.concatName(self.variable, {
                    escape: true
                });
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                return buffer.write(this.variableName());
            },
            generateJavaScriptTarget: function() {
                var args, self, gen1_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            },
            hashEntryField: function() {
                var self;
                self = this;
                return self.variable;
            },
            generateJavaScriptParameter: function() {
                var args, self, gen2_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            parameter: function() {
                var self;
                self = this;
                return self;
            },
            expandMacro: function() {
                var self, name, macro;
                self = this;
                name = self.variable;
                macro = self.cg.macros.findMacro(name);
                if (macro) {
                    return macro(name);
                }
            },
            declareVariable: function(variables, scope, gen3_options) {
                var shadow, self, name;
                shadow = gen3_options && gen3_options.hasOwnProperty("shadow") && gen3_options.shadow !== void 0 ? gen3_options.shadow : false;
                self = this;
                name = self.variableName();
                if (shadow || !scope.isDefined(name)) {
                    return variables.push(name);
                }
            }
        });
        return variable = function(name, gen4_options) {
            var couldBeMacro, macro;
            couldBeMacro = gen4_options && gen4_options.hasOwnProperty("couldBeMacro") && gen4_options.couldBeMacro !== void 0 ? gen4_options.couldBeMacro : true;
            if (couldBeMacro) {
                macro = terms.macros.findMacro(name);
                if (macro) {
                    return macro(name);
                }
            }
            return variableTerm(name);
        };
    };
})).call(this);