((function() {
    var self, UniqueNames, SymbolScope;
    self = this;
    UniqueNames = function() {
        var self, unique;
        self = this;
        unique = 0;
        self.generateName = function(name) {
            var self;
            self = this;
            unique = unique + 1;
            return "gen" + unique + "_" + name;
        };
        return void 0;
    };
    SymbolScope = exports.SymbolScope = function(parentScope, gen1_options) {
        var uniqueNames, self, variables;
        uniqueNames = gen1_options && gen1_options.hasOwnProperty("uniqueNames") && gen1_options.uniqueNames !== void 0 ? gen1_options.uniqueNames : new UniqueNames;
        self = this;
        variables = {};
        self.define = function(name) {
            var self;
            self = this;
            return variables[name] = true;
        };
        self.generateVariable = function(name) {
            var self;
            self = this;
            return uniqueNames.generateName(name);
        };
        self.isDefined = function(name) {
            var self;
            self = this;
            return variables.hasOwnProperty(name) || parentScope && parentScope.isDefined(name);
        };
        self.subScope = function() {
            var self;
            self = this;
            return new SymbolScope(self, {
                uniqueNames: uniqueNames
            });
        };
        return void 0;
    };
})).call(this);