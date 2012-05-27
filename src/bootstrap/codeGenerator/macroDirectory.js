((function() {
    var self, _;
    self = this;
    _ = require("underscore");
    exports.createMacroDirectory = function() {
        var self, cg;
        self = this;
        cg = this;
        return new function() {
            var self, nameTreeRoot;
            self = this;
            nameTreeRoot = {};
            self.nameNode = function(name) {
                var self, nameTree;
                self = this;
                nameTree = nameTreeRoot;
                _(name).each(function(nameSegment) {
                    if (!nameTree.hasOwnProperty(nameSegment)) {
                        return nameTree = nameTree[nameSegment] = {};
                    } else {
                        return nameTree = nameTree[nameSegment];
                    }
                });
                return nameTree;
            };
            self.addMacro = function(name, createMacro) {
                var self, nameTree;
                self = this;
                nameTree = self.nameNode(name);
                return nameTree["create macro"] = createMacro;
            };
            self.addWildCardMacro = function(name, matchMacro) {
                var self, nameTree, matchMacros;
                self = this;
                nameTree = self.nameNode(name);
                matchMacros = void 0;
                if (!nameTree.hasOwnProperty("match macro")) {
                    matchMacros = nameTree["match macro"] = [];
                } else {
                    matchMacros = nameTree["match macro"];
                }
                return matchMacros.push(matchMacro);
            };
            self.findMacro = function(name) {
                var self, findMatchingWildMacro, findMacroInTree;
                self = this;
                findMatchingWildMacro = function(wildMacros, name) {
                    var n;
                    n = 0;
                    while (n < wildMacros.length) {
                        var wildMacro, macro;
                        wildMacro = wildMacros[n];
                        macro = wildMacro(name);
                        if (macro) {
                            return macro;
                        }
                        n = n + 1;
                    }
                };
                findMacroInTree = function(nameTree, name, index, wildMacros) {
                    if (index < name.length) {
                        if (nameTree.hasOwnProperty(name[index])) {
                            var subtree;
                            subtree = nameTree[name[index]];
                            if (subtree.hasOwnProperty("match macro")) {
                                wildMacros = subtree["match macro"].concat(wildMacros);
                            }
                            return findMacroInTree(subtree, name, index + 1, wildMacros);
                        } else {
                            return findMatchingWildMacro(wildMacros, name);
                        }
                    } else {
                        if (nameTree.hasOwnProperty("create macro")) {
                            return nameTree["create macro"];
                        } else {
                            return findMatchingWildMacro(wildMacros, name);
                        }
                    }
                };
                return findMacroInTree(nameTreeRoot, name, 0, []);
            };
            self.invocation = function(name, arguments, optionalArguments) {
                var self, macro;
                self = this;
                macro = self.findMacro(name);
                if (macro) {
                    return macro(name, arguments, optionalArguments);
                } else if (arguments) {
                    return cg.functionCall(cg.variable(name), arguments, optionalArguments);
                } else {
                    return cg.variable(name);
                }
            };
            return self;
        };
    };
})).call(this);