(function() {
    var self = this;
    var $class, codegenUtils;
    $class = require("./class").class;
    codegenUtils = require("./terms/codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var moduleConstants;
        return moduleConstants = terms.term({
            constructor: function() {
                var self = this;
                self.namedDefinitions = {};
                return self.listeners = [];
            },
            defineAs: function(name, expression, gen1_options) {
                var self = this;
                var generated;
                generated = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "generated") && gen1_options.generated !== void 0 ? gen1_options.generated : true;
                var canonicalName, existingDefinition, variable;
                canonicalName = codegenUtils.concatName(name);
                existingDefinition = self.namedDefinitions[canonicalName];
                if (existingDefinition) {
                    return existingDefinition.target;
                } else {
                    variable = function() {
                        if (generated) {
                            return terms.generatedVariable(name);
                        } else {
                            return terms.variable(name, {
                                couldBeMacro: false
                            });
                        }
                    }();
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
                var gen2_items, gen3_i, listener;
                gen2_items = self.listeners;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    listener = gen2_items[gen3_i];
                    listener(d);
                }
                return void 0;
            },
            onEachNewDefinition: function(block) {
                var self = this;
                return self.listeners.push(block);
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var gen4_items, gen5_i, def;
                    gen4_items = self.definitions();
                    for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                        def = gen4_items[gen5_i];
                        buffer.write("var ");
                        buffer.write(def.generate(scope));
                        buffer.write(";");
                    }
                    return void 0;
                });
            }
        });
    };
}).call(this);