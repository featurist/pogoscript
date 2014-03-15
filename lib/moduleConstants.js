(function() {
    var self = this;
    var $class, codegenUtils;
    $class = require("./class").class;
    codegenUtils = require("./terms/codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var moduleConstants;
        return moduleConstants = $class({
            constructor: function() {
                var self = this;
                self.namedDefinitions = {};
                return self.listeners = [];
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
                    self.namedDefinitions[canonicalName] = function() {
                        var definition;
                        definition = terms.definition(variable, expression);
                        self.notifyNewDefinition(definition);
                        return definition;
                    }();
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
            notifyNewDefinition: function(d) {
                var self = this;
                var gen1_items, gen2_i, listener;
                gen1_items = self.listeners;
                for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
                    listener = gen1_items[gen2_i];
                    listener(d);
                }
                return void 0;
            },
            onEachNewDefinition: function(block) {
                var self = this;
                return self.listeners.push(block);
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var gen3_items, gen4_i, def;
                gen3_items = self.definitions();
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    def = gen3_items[gen4_i];
                    buffer.write("var ");
                    def.generateJavaScript(buffer, scope);
                    buffer.write(";");
                }
                return void 0;
            }
        });
    };
}).call(this);