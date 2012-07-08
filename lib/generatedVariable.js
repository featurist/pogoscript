((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(name) {
                var self;
                self = this;
                self.name = name;
                self.isVariable = true;
                return self.genVar = void 0;
            },
            dontClone: true,
            generatedName: function(scope) {
                var self;
                self = this;
                if (!self.genVar) {
                    self.genVar = scope.generateVariable(codegenUtils.concatName(self.name));
                }
                return self.genVar;
            },
            variableName: function(scope) {
                var self;
                self = this;
                return self.generatedName(scope);
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                return buffer.write(self.generatedName(scope));
            },
            generateJavaScriptParameter: function() {
                var args, self, gen1_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            },
            generateJavaScriptTarget: function() {
                var args, self, gen2_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            declareVariable: function(variables, scope) {
                var self, name;
                self = this;
                name = codegenUtils.concatName([ self.generatedName(scope) ]);
                if (!scope.isDefined(name)) {
                    return variables.push(name);
                }
            }
        });
    };
})).call(this);