(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./terms/codegenUtils");
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
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var gen1_items, gen2_i, def;
                gen1_items = self.definitions();
                for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
                    def = gen1_items[gen2_i];
                    buffer.write("var ");
                    def.generateJavaScript(buffer, scope);
                    buffer.write(";");
                }
                return void 0;
            }
        });
    };
}).call(this);