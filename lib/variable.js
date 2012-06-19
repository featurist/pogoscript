((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(name, gen1_options) {
                var shadow, self;
                shadow = gen1_options && gen1_options.hasOwnProperty("shadow") && gen1_options.shadow !== void 0 ? gen1_options.shadow : false;
                self = this;
                self.variable = name;
                self.isVariable = true;
                return self.shadow = shadow;
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
                var args, self, gen2_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            hashEntryField: function() {
                var self;
                self = this;
                return self.variable;
            },
            generateJavaScriptParameter: function() {
                var args, self, gen3_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen3_o = self;
                return gen3_o.generateJavaScript.apply(gen3_o, args);
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
            declareVariable: function(variables, scope) {
                var self, name;
                self = this;
                name = self.variableName();
                if (self.shadow || !scope.isDefined(name)) {
                    return variables.push(name);
                }
            }
        });
    };
})).call(this);