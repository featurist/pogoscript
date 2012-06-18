((function() {
    var self, _;
    self = this;
    _ = require("underscore");
    module.exports = function(terms) {
        var self, macroDirectory, createMacroDirectory;
        self = this;
        macroDirectory = $class({
            constructor: function() {
                var self;
                self = this;
                return self.nameTreeRoot = {};
            },
            nameNode: function(name) {
                var self, nameTree;
                self = this;
                nameTree = self.nameTreeRoot;
                _(name).each(function(nameSegment) {
                    if (!nameTree.hasOwnProperty(nameSegment)) {
                        return nameTree = nameTree[nameSegment] = {};
                    } else {
                        return nameTree = nameTree[nameSegment];
                    }
                });
                return nameTree;
            },
            addMacro: function(name, createMacro) {
                var self, nameTree;
                self = this;
                nameTree = self.nameNode(name);
                return nameTree["create macro"] = createMacro;
            },
            addWildCardMacro: function(name, matchMacro) {
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
            },
            findMacro: function(name) {
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
                return findMacroInTree(self.nameTreeRoot, name, 0, []);
            }
        });
        return createMacroDirectory = function() {
            var args, gen1_c;
            args = Array.prototype.slice.call(arguments, 0, arguments.length);
            gen1_c = function() {
                macroDirectory.apply(this, args);
            };
            gen1_c.prototype = macroDirectory.prototype;
            return new gen1_c;
        };
    };
})).call(this);