(function() {
    var self = this;
    var $class, classExtending, _, ms, sourceMap, buffer;
    $class = require("../class").class;
    classExtending = require("../class").classExtending;
    _ = require("underscore");
    ms = require("../memorystream");
    sourceMap = require("source-map");
    buffer = function() {
        var chunks;
        chunks = [];
        return {
            write: function(code) {
                var self = this;
                return chunks.push(code);
            },
            chunks: function() {
                var self = this;
                return chunks;
            }
        };
    };
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
                    locations = function() {
                        var gen1_results, gen2_items, gen3_i, c;
                        gen1_results = [];
                        gen2_items = children;
                        for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                            c = gen2_items[gen3_i];
                            (function(c) {
                                var loc;
                                loc = c.location();
                                if (loc) {
                                    return gen1_results.push(loc);
                                }
                            })(c);
                        }
                        return gen1_results;
                    }();
                    if (locations.length > 0) {
                        firstLine = _.min(function() {
                            var gen4_results, gen5_items, gen6_i, l;
                            gen4_results = [];
                            gen5_items = locations;
                            for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                                l = gen5_items[gen6_i];
                                (function(l) {
                                    return gen4_results.push(l.firstLine);
                                })(l);
                            }
                            return gen4_results;
                        }());
                        lastLine = _.max(function() {
                            var gen7_results, gen8_items, gen9_i, l;
                            gen7_results = [];
                            gen8_items = locations;
                            for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                                l = gen8_items[gen9_i];
                                (function(l) {
                                    return gen7_results.push(l.lastLine);
                                })(l);
                            }
                            return gen7_results;
                        }());
                        locationsOnFirstLine = function() {
                            var gen10_results, gen11_items, gen12_i, l;
                            gen10_results = [];
                            gen11_items = locations;
                            for (gen12_i = 0; gen12_i < gen11_items.length; ++gen12_i) {
                                l = gen11_items[gen12_i];
                                (function(l) {
                                    if (l.firstLine === firstLine) {
                                        return gen10_results.push(l);
                                    }
                                })(l);
                            }
                            return gen10_results;
                        }();
                        locationsOnLastLine = function() {
                            var gen13_results, gen14_items, gen15_i, l;
                            gen13_results = [];
                            gen14_items = locations;
                            for (gen15_i = 0; gen15_i < gen14_items.length; ++gen15_i) {
                                l = gen14_items[gen15_i];
                                (function(l) {
                                    if (l.lastLine === lastLine) {
                                        return gen13_results.push(l);
                                    }
                                })(l);
                            }
                            return gen13_results;
                        }();
                        return {
                            firstLine: firstLine,
                            lastLine: lastLine,
                            firstColumn: _.min(function() {
                                var gen16_results, gen17_items, gen18_i, l;
                                gen16_results = [];
                                gen17_items = locationsOnFirstLine;
                                for (gen18_i = 0; gen18_i < gen17_items.length; ++gen18_i) {
                                    l = gen17_items[gen18_i];
                                    (function(l) {
                                        return gen16_results.push(l.firstColumn);
                                    })(l);
                                }
                                return gen16_results;
                            }()),
                            lastColumn: _.max(function() {
                                var gen19_results, gen20_items, gen21_i, l;
                                gen19_results = [];
                                gen20_items = locationsOnLastLine;
                                for (gen21_i = 0; gen21_i < gen20_items.length; ++gen21_i) {
                                    l = gen20_items[gen21_i];
                                    (function(l) {
                                        return gen19_results.push(l.lastColumn);
                                    })(l);
                                }
                                return gen19_results;
                            }()),
                            filename: locations[0].filename
                        };
                    } else {
                        return void 0;
                    }
                }
            },
            clone: function(gen22_options) {
                var self = this;
                var rewrite, limit, createObject;
                rewrite = gen22_options !== void 0 && Object.prototype.hasOwnProperty.call(gen22_options, "rewrite") && gen22_options.rewrite !== void 0 ? gen22_options.rewrite : function(subterm) {
                    return void 0;
                };
                limit = gen22_options !== void 0 && Object.prototype.hasOwnProperty.call(gen22_options, "limit") && gen22_options.limit !== void 0 ? gen22_options.limit : function(subterm) {
                    return false;
                };
                createObject = gen22_options !== void 0 && Object.prototype.hasOwnProperty.call(gen22_options, "createObject") && gen22_options.createObject !== void 0 ? gen22_options.createObject : function(node) {
                    return Object.create(Object.getPrototypeOf(node));
                };
                var cloneObject, cloneNode, cloneArray, cloneSubterm;
                cloneObject = function(node, allowRewrite, path) {
                    var t, member;
                    t = createObject(node);
                    for (member in node) {
                        (function(member) {
                            if (node.hasOwnProperty(member)) {
                                t[member] = cloneSubterm(node[member], allowRewrite && member[0] !== "_", path);
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
                        return function() {
                            var gen23_results, gen24_items, gen25_i, node;
                            gen23_results = [];
                            gen24_items = terms;
                            for (gen25_i = 0; gen25_i < gen24_items.length; ++gen25_i) {
                                node = gen24_items[gen25_i];
                                (function(node) {
                                    return gen23_results.push(cloneSubterm(node, allowRewrite, path));
                                })(node);
                            }
                            return gen23_results;
                        }();
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
                    var gen26_items, gen27_i, item;
                    if (member instanceof Node) {
                        return children.push(member);
                    } else if (member instanceof Array) {
                        gen26_items = member;
                        for (gen27_i = 0; gen27_i < gen26_items.length; ++gen27_i) {
                            item = gen26_items[gen27_i];
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
                            if (object.hasOwnProperty(property) && property[0] !== "_") {
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
            walkDescendants: function(walker, gen28_options) {
                var self = this;
                var limit;
                limit = gen28_options !== void 0 && Object.prototype.hasOwnProperty.call(gen28_options, "limit") && gen28_options.limit !== void 0 ? gen28_options.limit : function() {
                    return false;
                };
                var path, walkChildren;
                path = [];
                walkChildren = function(node) {
                    var gen29_items, gen30_i, child;
                    try {
                        path.push(node);
                        gen29_items = node.children();
                        for (gen30_i = 0; gen30_i < gen29_items.length; ++gen30_i) {
                            child = gen29_items[gen30_i];
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
            reduceWithReducedChildrenInto: function(reducer, gen31_options) {
                var self = this;
                var limit, cacheName;
                limit = gen31_options !== void 0 && Object.prototype.hasOwnProperty.call(gen31_options, "limit") && gen31_options.limit !== void 0 ? gen31_options.limit : function(term) {
                    return false;
                };
                cacheName = gen31_options !== void 0 && Object.prototype.hasOwnProperty.call(gen31_options, "cacheName") && gen31_options.cacheName !== void 0 ? gen31_options.cacheName : void 0;
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
                    var mappedChildren, gen32_items, gen33_i, child;
                    try {
                        path.push(node);
                        mappedChildren = [];
                        gen32_items = node.children();
                        for (gen33_i = 0; gen33_i < gen32_items.length; ++gen33_i) {
                            child = gen32_items[gen33_i];
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
            arguments: function() {
                var self = this;
                return self;
            },
            inspectTerm: function(gen34_options) {
                var self = this;
                var depth;
                depth = gen34_options !== void 0 && Object.prototype.hasOwnProperty.call(gen34_options, "depth") && gen34_options.depth !== void 0 ? gen34_options.depth : 20;
                var util;
                util = require("util");
                return util.inspect(self, false, depth);
            },
            show: function(gen35_options) {
                var self = this;
                var desc, depth;
                desc = gen35_options !== void 0 && Object.prototype.hasOwnProperty.call(gen35_options, "desc") && gen35_options.desc !== void 0 ? gen35_options.desc : void 0;
                depth = gen35_options !== void 0 && Object.prototype.hasOwnProperty.call(gen35_options, "depth") && gen35_options.depth !== void 0 ? gen35_options.depth : 20;
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
                return self.cg.errors.addTermWithMessage(self, "this cannot be used as a parameter");
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
                    rewrite: function(term, gen36_options) {
                        var clone;
                        clone = gen36_options !== void 0 && Object.prototype.hasOwnProperty.call(gen36_options, "clone") && gen36_options.clone !== void 0 ? gen36_options.clone : void 0;
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
                    rewrite: function(term, gen37_options) {
                        var clone;
                        clone = gen37_options !== void 0 && Object.prototype.hasOwnProperty.call(gen37_options, "clone") && gen37_options.clone !== void 0 ? gen37_options.clone : void 0;
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
            definitions: function() {
                var self = this;
                var defs;
                defs = [];
                self.walkDescendantsNotBelowIf(function(term) {
                    if (term.isDefinition) {
                        return defs.push(term);
                    }
                }, function(term) {
                    return term.isNewScope;
                });
                if (self.isDefinition) {
                    defs.push(self);
                }
                return defs;
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
            containsAsync: function() {
                var self = this;
                var isAsync;
                isAsync = false;
                self.walkDescendants(function(term) {
                    return isAsync = isAsync || term.isDefinition && term.isAsync;
                }, {
                    limit: function(term) {
                        return term.isClosure;
                    }
                });
                return isAsync;
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return returnTerm(self);
            },
            asyncify: function() {
                var self = this;
                return void 0;
            },
            alreadyPromise: function() {
                var self = this;
                self._alreadyPromise = true;
                return self;
            },
            promisify: function() {
                var self = this;
                if (self._alreadyPromise) {
                    return self;
                } else {
                    return cg.methodCall(cg.promise(), [ "resolve" ], [ self ]).alreadyPromise();
                }
            },
            code: function() {
                var self = this;
                var chunks = Array.prototype.slice.call(arguments, 0, arguments.length);
                var location;
                location = self.location();
                if (location) {
                    return new sourceMap.SourceNode(location.firstLine, location.firstColumn, location.filename, chunks);
                } else {
                    return chunks;
                }
            },
            generateIntoBuffer: function(generateCodeIntoBuffer) {
                var self = this;
                var chunks, location;
                chunks = function() {
                    var b;
                    b = buffer();
                    generateCodeIntoBuffer(b);
                    return b.chunks();
                }();
                location = self.location();
                if (location) {
                    return new sourceMap.SourceNode(location.firstLine, location.firstColumn, location.filename, chunks);
                } else {
                    return chunks;
                }
            },
            generateStatement: function(scope) {
                var self = this;
                return self.code(self.generate(scope), ";");
            },
            generateFunction: function(scope) {
                var self = this;
                return self.generate(scope);
            }
        });
        termPrototype = new Term();
        term = function(members) {
            var termConstructor, gen38_c;
            termConstructor = classExtending(Term, members);
            return function() {
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen38_c;
                gen38_c = function() {
                    termConstructor.apply(this, args);
                };
                gen38_c.prototype = termConstructor.prototype;
                return new gen38_c();
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