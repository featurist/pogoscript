((function() {
    var self, UniqueNames, Scope;
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
    Scope = exports.Scope = function(parentScope, uniqueNames) {
        var self, variables;
        self = this;
        uniqueNames = uniqueNames || new UniqueNames;
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
            return new Scope(self, uniqueNames);
        };
        return void 0;
    };
})).call(this);