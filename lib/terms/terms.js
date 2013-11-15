(function() {
    var self = this;
    var _, util;
    require("../class");
    _ = require("underscore");
    util = require("util");
    module.exports = function(cg) {
        var self = this;
        var Node, Term, termPrototype, term;
        Node = $class({
            cg: cg,
            constructor: function(members) {
                var self = this;
                var member;
                if (members) {
                    for (member in members) {
                        (function(member) {
                            if (members.hasOwnProperty(member)) {
                                self[member] = members[member];
                            }
                        })(member);
                    }
                    return void 0;
                }
            },
            setLocation: function(newLocation) {
                var self = this;
                return Object.defineProperty(self, "_location", {
                    value: newLocation,
                    writable: true
                });
            },
            location: function() {
                var self = this;
                var children, locations, firstLine, lastLine, locationsOnFirstLine, locationsOnLastLine;
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
                var self = this;
                var rewrite, limit, createObject;
                rewrite = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : function(subterm) {
                    return void 0;
                };
                limit = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "limit") && gen1_options.limit !== void 0 ? gen1_options.limit : function(subterm) {
                    return false;
                };
                createObject = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "createObject") && gen1_options.createObject !== void 0 ? gen1_options.createObject : function(node) {
                    return Object.create(Object.getPrototypeOf(node));
                };
                var cloneObject, cloneNode, cloneArray, cloneSubterm;
                cloneObject = function(node, allowRewrite, path) {
                    var t, member;
                    t = createObject(node);
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
                    var rewrittenNode, subClone;
                    if (originalNode.dontClone) {
                        return originalNode;
                    } else {
                        try {
                            path.push(originalNode);
                            rewrittenNode = function() {
                                if (originalNode instanceof Node && allowRewrite) {
                                    subClone = function(node) {
                                        if (node) {
                                            return cloneSubterm(node, allowRewrite, path);
                                        } else {
                                            return cloneObject(originalNode, allowRewrite, path);
                                        }
                                    };
                                    return rewrite(originalNode, {
                                        path: path,
                                        clone: subClone,
                                        rewrite: subClone
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
                var self = this;
                return self.setLocation(ancestorNode.location());
            },
            rewrite: function(options) {
                var self = this;
                options = options || {};
                options.createObject = function(node) {
                    var self = this;
                    return node;
                };
                return self.clone(options);
            },
            children: function() {
                var self = this;
                var children, addMember, addMembersInObject;
                children = [];
                addMember = function(member) {
                    var gen2_items, gen3_i, item;
                    if (member instanceof Node) {
                        return children.push(member);
                    } else if (member instanceof Array) {
                        gen2_items = member;
                        for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                            item = gen2_items[gen3_i];
                            addMember(item);
                        }
                        return void 0;
                    } else if (member instanceof Object) {
                        return addMembersInObject(member);
                    }
                };
                addMembersInObject = function(object) {
                    var property;
                    for (property in object) {
                        (function(property) {
                            var member;
                            if (object.hasOwnProperty(property)) {
                                member = object[property];
                                addMember(member);
                            }
                        })(property);
                    }
                    return void 0;
                };
                addMembersInObject(self);
                return children;
            },
            walkDescendants: function(walker, gen4_options) {
                var self = this;
                var limit;
                limit = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "limit") && gen4_options.limit !== void 0 ? gen4_options.limit : function() {
                    return false;
                };
                var path, walkChildren;
                path = [];
                walkChildren = function(node) {
                    var gen5_items, gen6_i, child;
                    try {
                        path.push(node);
                        gen5_items = node.children();
                        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                            child = gen5_items[gen6_i];
                            walker(child, path);
                            if (!limit(child, path)) {
                                walkChildren(child);
                            }
                        }
                        return void 0;
                    } finally {
                        path.pop();
                    }
                };
                return walkChildren(self);
            },
            walkDescendantsNotBelowIf: function(walker, limit) {
                var self = this;
                return self.walkDescendants(walker, {
                    limit: limit
                });
            },
            reduceWithReducedChildrenInto: function(reducer, gen7_options) {
                var self = this;
                var limit, cacheName;
                limit = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "limit") && gen7_options.limit !== void 0 ? gen7_options.limit : function(term) {
                    return false;
                };
                cacheName = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "cacheName") && gen7_options.cacheName !== void 0 ? gen7_options.cacheName : void 0;
                var path, cachingReducer, mapReduceChildren;
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
                        for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
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
                var self = this;
                self.generateJavaScript(buffer, scope);
                return buffer.write(";");
            },
            arguments: function() {
                var self = this;
                return self;
            },
            inspectTerm: function(gen10_options) {
                var self = this;
                var depth;
                depth = gen10_options !== void 0 && Object.prototype.hasOwnProperty.call(gen10_options, "depth") && gen10_options.depth !== void 0 ? gen10_options.depth : 20;
                return util.inspect(self, false, depth);
            },
            show: function(gen11_options) {
                var self = this;
                var desc, depth;
                desc = gen11_options !== void 0 && Object.prototype.hasOwnProperty.call(gen11_options, "desc") && gen11_options.desc !== void 0 ? gen11_options.desc : void 0;
                depth = gen11_options !== void 0 && Object.prototype.hasOwnProperty.call(gen11_options, "depth") && gen11_options.depth !== void 0 ? gen11_options.depth : 20;
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
                var self = this;
                return self.cg.errors.addTermWithMessage(self, "cannot be used as a hash entry");
            },
            hashEntryField: function() {
                var self = this;
                return self.cg.errors.addTermWithMessage(self, "cannot be used as a field name");
            },
            blockify: function(parameters, options) {
                var self = this;
                return self.cg.block(parameters, self.cg.asyncStatements([ self ]), options);
            },
            scopify: function() {
                var self = this;
                return self;
            },
            parameter: function() {
                var self = this;
                return this.cg.errors.addTermWithMessage(self, "this cannot be used as a parameter");
            },
            subterms: function() {
                var self = this;
                return void 0;
            },
            expandMacro: function() {
                var self = this;
                return void 0;
            },
            expandMacros: function() {
                var self = this;
                return self.clone({
                    rewrite: function(term, gen12_options) {
                        var clone;
                        clone = gen12_options !== void 0 && Object.prototype.hasOwnProperty.call(gen12_options, "clone") && gen12_options.clone !== void 0 ? gen12_options.clone : void 0;
                        return term.expandMacro(clone);
                    }
                });
            },
            rewriteStatements: function() {
                var self = this;
                return void 0;
            },
            rewriteAllStatements: function() {
                var self = this;
                return self.clone({
                    rewrite: function(term, gen13_options) {
                        var clone;
                        clone = gen13_options !== void 0 && Object.prototype.hasOwnProperty.call(gen13_options, "clone") && gen13_options.clone !== void 0 ? gen13_options.clone : void 0;
                        return term.rewriteStatements(clone);
                    }
                });
            },
            serialiseSubStatements: function() {
                var self = this;
                return void 0;
            },
            serialiseStatements: function() {
                var self = this;
                return void 0;
            },
            serialiseAllStatements: function() {
                var self = this;
                return self.rewrite({
                    rewrite: function(term) {
                        return term.serialiseStatements();
                    }
                });
            },
            defineVariables: function() {
                var self = this;
                return void 0;
            },
            canonicalName: function() {
                var self = this;
                return void 0;
            },
            makeAsyncWithCallbackForResult: function(createCallbackForResult) {
                var self = this;
                return void 0;
            },
            containsContinuation: function() {
                var self = this;
                var found;
                found = false;
                self.walkDescendants(function(term) {
                    return found = term.isContinuation || found;
                }, {
                    limit: function(term) {
                        return term.isClosure && term.isAsync;
                    }
                });
                return found;
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                if (self.containsContinuation()) {
                    return self;
                } else {
                    return returnTerm(self);
                }
            },
            asyncify: function() {
                var self = this;
                return void 0;
            }
        });
        termPrototype = new Term();
        term = function(members) {
            var termConstructor;
            termConstructor = classExtending(Term, members);
            return function() {
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen14_c;
                gen14_c = function() {
                    termConstructor.apply(this, args);
                };
                gen14_c.prototype = termConstructor.prototype;
                return new gen14_c();
            };
        };
        return {
            Node: Node,
            Term: Term,
            term: term,
            termPrototype: termPrototype
        };
    };
}).call(this);