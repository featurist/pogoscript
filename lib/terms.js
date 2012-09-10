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
                var self, member;
                self = this;
                if (members) {
                    for (member in members) {
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
                var self, children, locations, firstLine, lastLine, locationsOnFirstLine, locationsOnLastLine;
                self = this;
                if (self._location) {
                    return self._location;
                } else {
                    children = self.children();
                    locations = _.filter(_.map(children, function(child) {
                        return child.location();
                    }), function(location) {
                        return location;
                    });
                    if (locations.length > 0) {
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
                var rewrite, limit, self, cloneObject, cloneNode, cloneArray, cloneSubterm;
                rewrite = gen1_options && gen1_options.hasOwnProperty("rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : function(subterm) {
                    return void 0;
                };
                limit = gen1_options && gen1_options.hasOwnProperty("limit") && gen1_options.limit !== void 0 ? gen1_options.limit : function(subterm) {
                    return false;
                };
                self = this;
                cloneObject = function(node, allowRewrite, path) {
                    var t, member;
                    t = Object.create(Object.getPrototypeOf(node));
                    for (member in node) {
                        (function(member) {
                            if (node.hasOwnProperty(member)) {
                                t[member] = cloneSubterm(node[member], allowRewrite, path);
                            }
                        })(member);
                    }
                    return t;
                };
                cloneNode = function(originalNode, allowRewrite, path) {
                    var rewrittenNode;
                    if (originalNode.dontClone) {
                        return originalNode;
                    } else {
                        try {
                            path.push(originalNode);
                            rewrittenNode = function() {
                                if (originalNode instanceof Node && allowRewrite) {
                                    return rewrite(originalNode, {
                                        path: path,
                                        clone: function(node) {
                                            if (node) {
                                                return cloneSubterm(node, allowRewrite, path);
                                            } else {
                                                return cloneObject(originalNode, allowRewrite, path);
                                            }
                                        }
                                    });
                                } else {
                                    return void 0;
                                }
                            }();
                            if (!rewrittenNode) {
                                return cloneObject(originalNode, allowRewrite, path);
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
                        return cloneNode(subterm, allowRewrite && !limit(subterm, {
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
                    var gen2_items, gen3_i, item;
                    if (member instanceof Node) {
                        return children.push(member);
                    } else if (member instanceof Array) {
                        gen2_items = member;
                        for (gen3_i = 0; gen3_i < gen2_items.length; gen3_i++) {
                            item = gen2_items[gen3_i];
                            addMember(item);
                        }
                    } else if (member instanceof Object) {
                        return addMembersInObject(member);
                    }
                };
                addMembersInObject = function(object) {
                    var property, member;
                    for (property in object) {
                        (function(property) {
                            if (object.hasOwnProperty(property)) {
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
                    var gen5_items, gen6_i, child;
                    try {
                        path.push(node);
                        gen5_items = node.children();
                        for (gen6_i = 0; gen6_i < gen5_items.length; gen6_i++) {
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
            },
            reduceWithReducedChildrenInto: function(reducer, gen7_options) {
                var limit, cacheName, self, path, cachingReducer, mapReduceChildren;
                limit = gen7_options && gen7_options.hasOwnProperty("limit") && gen7_options.limit !== void 0 ? gen7_options.limit : function(term) {
                    return false;
                };
                cacheName = gen7_options && gen7_options.hasOwnProperty("cacheName") && gen7_options.cacheName !== void 0 ? gen7_options.cacheName : void 0;
                self = this;
                path = [];
                cachingReducer = function() {
                    if (cacheName) {
                        return function(node, reducedChildren) {
                            var reducedValue;
                            if (node.hasOwnProperty("reductionCache")) {
                                if (node.reductionCache.hasOwnProperty(cacheName)) {
                                    return node.reductionCache[cacheName];
                                }
                            } else {
                                reducedValue = reducer(node, reducedChildren);
                                if (!node.hasOwnProperty("reductionCache")) {
                                    node.reductionCache = {};
                                }
                                node.reductionCache[cacheName] = reducedValue;
                                return reducedValue;
                            }
                        };
                    } else {
                        return reducer;
                    }
                }();
                mapReduceChildren = function(node) {
                    var mappedChildren, gen8_items, gen9_i, child;
                    try {
                        path.push(node);
                        mappedChildren = [];
                        gen8_items = node.children();
                        for (gen9_i = 0; gen9_i < gen8_items.length; gen9_i++) {
                            child = gen8_items[gen9_i];
                            if (!limit(child, path)) {
                                mappedChildren.push(mapReduceChildren(child));
                            }
                        }
                        return cachingReducer(node, mappedChildren);
                    } finally {
                        path.pop();
                    }
                };
                return mapReduceChildren(self);
            }
        });
        Term = classExtending(Node, {
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
            inspectTerm: function(gen10_options) {
                var depth, self;
                depth = gen10_options && gen10_options.hasOwnProperty("depth") && gen10_options.depth !== void 0 ? gen10_options.depth : 20;
                self = this;
                return util.inspect(self, false, depth);
            },
            show: function(gen11_options) {
                var desc, depth, self;
                desc = gen11_options && gen11_options.hasOwnProperty("desc") && gen11_options.desc !== void 0 ? gen11_options.desc : void 0;
                depth = gen11_options && gen11_options.hasOwnProperty("depth") && gen11_options.depth !== void 0 ? gen11_options.depth : 20;
                self = this;
                if (desc) {
                    return console.log(desc, self.inspectTerm({
                        depth: depth
                    }));
                } else {
                    return console.log(self.inspectTerm({
                        depth: depth
                    }));
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
            blockify: function(parameters, optionalParameters, gen12_options) {
                var async, self, b;
                async = gen12_options && gen12_options.hasOwnProperty("async") && gen12_options.async !== void 0 ? gen12_options.async : false;
                self = this;
                b = self.cg.block(parameters, self.cg.statements([ self ]), {
                    async: async
                });
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
                    rewrite: function(term, gen13_options) {
                        var clone;
                        clone = gen13_options && gen13_options.hasOwnProperty("clone") && gen13_options.clone !== void 0 ? gen13_options.clone : void 0;
                        return term.expandMacro(clone);
                    }
                });
            },
            rewriteStatements: function() {
                var self;
                self = this;
                return void 0;
            },
            rewriteAllStatements: function() {
                var self;
                self = this;
                return self.clone({
                    rewrite: function(term, gen14_options) {
                        var clone;
                        clone = gen14_options && gen14_options.hasOwnProperty("clone") && gen14_options.clone !== void 0 ? gen14_options.clone : void 0;
                        return term.rewriteStatements(clone);
                    }
                });
            },
            rewrite: function() {
                var self;
                self = this;
                return self.expandMacros().rewriteAllStatements();
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
            },
            makeAsyncWithCallbackForResult: function(createCallbackForResult) {
                var self;
                self = this;
                return void 0;
            },
            rewriteResultTermInto: function(returnTerm) {
                var self;
                self = this;
                return returnTerm(self);
            }
        });
        termPrototype = new Term;
        term = function(members) {
            var termConstructor;
            termConstructor = classExtending(Term, members);
            return function() {
                var args, gen15_c;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                gen15_c = function() {
                    termConstructor.apply(this, args);
                };
                gen15_c.prototype = termConstructor.prototype;
                return new gen15_c;
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