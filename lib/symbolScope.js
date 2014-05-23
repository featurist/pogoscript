(function() {
    var self = this;
    var UniqueNames, SymbolScope;
    UniqueNames = function() {
        var self = this;
        var unique;
        unique = 0;
        self.generateName = function(name) {
            var self = this;
            unique = unique + 1;
            return "gen" + unique + "_" + name;
        };
        return void 0;
    };
    SymbolScope = exports.SymbolScope = function(parentScope, gen1_options) {
        var self = this;
        var uniqueNames;
        uniqueNames = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "uniqueNames") && gen1_options.uniqueNames !== void 0 ? gen1_options.uniqueNames : new UniqueNames();
        var variables, tags;
        variables = {};
        tags = {};
        self.define = function(name) {
            var self = this;
            return variables[name] = true;
        };
        self.generateVariable = function(name) {
            var self = this;
            return uniqueNames.generateName(name);
        };
        self.isDefined = function(name) {
            var self = this;
            return self.isDefinedInThisScope(name) || parentScope && parentScope.isDefined(name);
        };
        self.isDefinedInThisScope = function(name) {
            var self = this;
            return variables.hasOwnProperty(name);
        };
        self.subScope = function() {
            var self = this;
            return new SymbolScope(self, {
                uniqueNames: uniqueNames
            });
        };
        self.defineWithTag = function(name, tag) {
            var self = this;
            self.define(name);
            return tags[tag] = name;
        };
        self.findTag = function(tag) {
            var self = this;
            return tags[tag] || parentScope && parentScope.findTag(tag);
        };
        self.names = function() {
            var self = this;
            return function() {
                var gen2_results, gen3_items, gen4_i, key;
                gen2_results = [];
                gen3_items = Object.keys(variables);
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    key = gen3_items[gen4_i];
                    (function(key) {
                        if (variables.hasOwnProperty(key)) {
                            return gen2_results.push(key);
                        }
                    })(key);
                }
                return gen2_results;
            }();
        };
        return void 0;
    };
}).call(this);