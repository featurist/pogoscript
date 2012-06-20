((function() {
    var self, _, util;
    self = this;
    require("./class");
    _ = require("underscore");
    util = require("util");
    module.exports = function(cg) {
        var self, Node, Term, termPrototype, term;
        self = this;
        Node = $class({
            cg: cg,
            constructor: function(members) {
                var self;
                self = this;
                if (members) {
                    var member;
                    for (var member in members) {
                        (function(member) {
                            if (members.hasOwnProperty(member)) {
                                self[member] = members[member];
                            }
                        })(member);
                    }
                }
            },
            setLocation: function(newLocation) {
                var self;
                self = this;
                return self._location = newLocation;
            },
            location: function() {
                var self;
                self = this;
                if (self._location) {
                    return self._location;
                } else {
                    var children, locations;
                    children = self.children();
                    locations = _.filter(_.map(children, function(child) {
                        return child.location();
                    }), function(location) {
                        return location;
                    });
                    if (locations.length > 0) {
                        var firstLine, lastLine, locationsOnFirstLine, locationsOnLastLine;
                        firstLine = _.min(_.map(locations, function(location) {
                            return location.firstLine;
                        }));
                        lastLine = _.max(_.map(locations, function(location) {
                            return location.lastLine;
                        }));
                        locationsOnFirstLine = _.filter(locations, function(location) {
                            return location.firstLine === firstLine;
                        });
                        locationsOnLastLine = _.filter(locations, function(location) {
                            return location.lastLine === lastLine;
                        });
                        return {
                            firstLine: firstLine,
                            lastLine: lastLine,
                            firstColumn: _.min(_.map(locationsOnFirstLine, function(location) {
                                return location.firstColumn;
                            })),
                            lastColumn: _.max(_.map(locationsOnLastLine, function(location) {
                                return location.lastColumn;
                            }))
                        };
                    } else {
                        return void 0;
                    }
                }
            },
            clone: function(gen1_options) {
                var rewrite, limit, self, cloneObject, cloneArray, cloneSubterm;
                rewrite = gen1_options && gen1_options.hasOwnProperty("rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : function(subterm) {
                    return void 0;
                };
                limit = gen1_options && gen1_options.hasOwnProperty("limit") && gen1_options.limit !== void 0 ? gen1_options.limit : function(subterm) {
                    return false;
                };
                self = this;
                cloneObject = function(originalNode, allowRewrite, path) {
                    if (originalNode.dontClone) {
                        return originalNode;
                    } else {
                        try {
                            var rewrittenNode;
                            path.push(originalNode);
                            rewrittenNode = function() {
                                if (originalNode instanceof Node && allowRewrite) {
                                    return rewrite(originalNode, {
                                        path: path,
                                        clone: function(node) {
                                            return cloneSubterm(node, allowRewrite, path);
                                        }
                                    });
                                } else {
                                    return void 0;
                                }
                            }();
                            if (!rewrittenNode) {
                                var t, member;
                                t = Object.create(Object.getPrototypeOf(originalNode));
                                for (var member in originalNode) {
                                    (function(member) {
                                        if (originalNode.hasOwnProperty(member)) {
                                            t[member] = cloneSubterm(originalNode[member], allowRewrite, path);
                                        }
                                    })(member);
                                }
                                return t;
                            } else {
                                if (!(rewrittenNode instanceof Node)) {
                                    throw new Error("rewritten node not an instance of Node");
                                }
                                rewrittenNode.isDerivedFrom(originalNode);
                                return rewrittenNode;
                            }
                        } finally {
                            path.pop();
                        }
                    }
                };
                cloneArray = function(terms, allowRewrite, path) {
                    try {
                        path.push(terms);
                        return _.map(terms, function(node) {
                            return cloneSubterm(node, allowRewrite, path);
                        });
                    } finally {
                        path.pop();
                    }
                };
                cloneSubterm = function(subterm, allowRewrite, path) {
                    if (subterm instanceof Array) {
                        return cloneArray(subterm, allowRewrite, path);
                    } else if (subterm instanceof Function) {
                        return subterm;
                    } else if (subterm instanceof Object) {
                        return cloneObject(subterm, allowRewrite && !limit(subterm, {
                            path: path
                        }), path);
                    } else {
                        return subterm;
                    }
                };
                return cloneSubterm(self, true, []);
            },
            isDerivedFrom: function(ancestorNode) {
                var self;
                self = this;
                return self.setLocation(ancestorNode.location());
            },
            children: function() {
                var self, children, addMember, addMembersInObject;
                self = this;
                children = [];
                addMember = function(member) {
                    if (member instanceof Node) {
                        return children.push(member);
                    } else if (member instanceof Array) {
                        var gen2_items, gen3_i;
                        gen2_items = member;
                        for (gen3_i = 0; gen3_i < gen2_items.length; gen3_i++) {
                            var item;
                            item = gen2_items[gen3_i];
                            addMember(item);
                        }
                    } else if (member instanceof Object) {
                        return addMembersInObject(member);
                    }
                };
                addMembersInObject = function(object) {
                    var property;
                    for (var property in object) {
                        (function(property) {
                            if (object.hasOwnProperty(property)) {
                                var member;
                                member = object[property];
                                addMember(member);
                            }
                        })(property);
                    }
                };
                addMembersInObject(self);
                return children;
            },
            walkDescendants: function(walker, gen4_options) {
                var limit, self, path, walkChildren;
                limit = gen4_options && gen4_options.hasOwnProperty("limit") && gen4_options.limit !== void 0 ? gen4_options.limit : function() {
                    return false;
                };
                self = this;
                path = [];
                walkChildren = function(node) {
                    try {
                        var gen5_items, gen6_i;
                        path.push(node);
                        gen5_items = node.children();
                        for (gen6_i = 0; gen6_i < gen5_items.length; gen6_i++) {
                            var child;
                            child = gen5_items[gen6_i];
                            walker(child, path);
                            if (!limit(child, path)) {
                                walkChildren(child);
                            }
                        }
                    } finally {
                        path.pop();
                    }
                };
                return walkChildren(self);
            },
            walkDescendantsNotBelowIf: function(walker, limit) {
                var self;
                self = this;
                return self.walkDescendants(walker, {
                    limit: limit
                });
            }
        });
        Term = classExtending(Node, {
            generateJavaScriptReturn: function(buffer, scope) {
                var self;
                self = this;
                buffer.write("return ");
                self.generateJavaScript(buffer, scope);
                return buffer.write(";");
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self;
                self = this;
                self.generateJavaScript(buffer, scope);
                return buffer.write(";");
            },
            arguments: function() {
                var self;
                self = this;
                return self;
            },
            inspectTerm: function() {
                var self;
                self = this;
                return util.inspect(self, false, 20);
            },
            show: function(desc) {
                var self;
                self = this;
                if (desc) {
                    return console.log(desc, self.inspectTerm());
                } else {
                    return console.log(self.inspectTerm());
                }
            },
            hashEntry: function() {
                var self;
                self = this;
                return self.cg.errors.addTermWithMessage(self, "cannot be used as a hash entry");
            },
            hashEntryField: function() {
                var self;
                self = this;
                return self.cg.errors.addTermWithMessage(self, "cannot be used as a field name");
            },
            blockify: function(parameters, optionalParameters) {
                var self, b;
                self = this;
                b = self.cg.block(parameters, self.cg.statements([ self ]));
                b.optionalParameters = optionalParameters;
                return b;
            },
            scopify: function() {
                var self;
                self = this;
                return self;
            },
            parameter: function() {
                var self;
                self = this;
                return this.cg.errors.addTermWithMessage(self, "this cannot be used as a parameter");
            },
            subterms: function() {
                var self;
                self = this;
                return void 0;
            },
            expandMacro: function() {
                var self;
                self = this;
                return void 0;
            },
            expandMacros: function() {
                var self;
                self = this;
                return self.clone({
                    rewrite: function(term, gen7_options) {
                        var clone;
                        clone = gen7_options && gen7_options.hasOwnProperty("clone") && gen7_options.clone !== void 0 ? gen7_options.clone : void 0;
                        return term.expandMacro(clone);
                    }
                });
            },
            serialiseSubStatements: function() {
                var self;
                self = this;
                return void 0;
            },
            declareVariables: function() {
                var self;
                self = this;
                return void 0;
            },
            declareVariable: function() {
                var self;
                self = this;
                return void 0;
            }
        });
        termPrototype = new Term;
        term = function(members) {
            var termConstructor;
            termConstructor = classExtending(Term, members);
            return function() {
                var args, gen8_c;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                gen8_c = function() {
                    termConstructor.apply(this, args);
                };
                gen8_c.prototype = termConstructor.prototype;
                return new gen8_c;
            };
        };
        return {
            Node: Node,
            Term: Term,
            term: term,
            termPrototype: termPrototype
        };
    };
})).call(this);