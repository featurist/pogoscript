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
            variableName: function(scope) {
                var self = this;
                return self.generatedName(scope);
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(self.generatedName(scope));
            },
            generateJavaScriptParameter: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            },
            generateJavaScriptTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            declareVariable: function(variables, scope, gen3_options) {
                var self = this;
                var shadow;
                shadow = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "shadow") && gen3_options.shadow !== void 0 ? gen3_options.shadow : false;
                var name;
                name = self.generatedName(scope);
                if (shadow || !scope.isDefined(name)) {
                    return variables.push(name);
                }
            }
        });
    };
}).call(this);