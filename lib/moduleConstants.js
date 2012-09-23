((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self, moduleConstants;
        self = this;
        return moduleConstants = $class({
            constructor: function() {
                var self;
                self = this;
                return self.namedDefinitions = {};
            },
            defineAs: function(name, expression) {
                var self, canonicalName, existingDefinition, variable;
                self = this;
                canonicalName = codegenUtils.concatName(name);
                existingDefinition = self.namedDefinitions[canonicalName];
                if (existingDefinition) {
                    return existingDefinition.target;
                } else {
                    variable = terms.generatedVariable(name);
                    self.namedDefinitions[canonicalName] = terms.definition(variable, expression);
                    return variable;
                }
            },
            definitions: function() {
                var self, defs, name;
                self = this;
                defs = [];
                for (name in self.namedDefinitions) {
                    (function(name) {
                        var definition;
                        definition = self.namedDefinitions[name];
                        defs.push(definition);
                    })(name);
                }
                return defs;
            }
        });
    };
})).call(this);