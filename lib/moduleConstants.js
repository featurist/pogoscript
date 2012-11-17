(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var moduleConstants;
        return moduleConstants = $class({
            constructor: function() {
                var self = this;
                return self.namedDefinitions = {};
            },
            defineAs: function(name, expression) {
                var self = this;
                var canonicalName, existingDefinition, variable;
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
                var self = this;
                var defs, name;
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
}).call(this);