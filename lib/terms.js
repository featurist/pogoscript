((function() {
    var self, _, util;
    self = this;
    require("./class");
    _ = require("underscore");
    util = require("util");
    module.exports = function(cg) {
        var self, term, termPrototype;
        self = this;
        term = $class({
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
                    var children, locations, firstLine, lastLine, locationsOnFirstLine, locationsOnLastLine;
                    children = self.children();
                    locations = _.map(children, function(child) {
                        return child.location();
                    });
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
                }
            },
            clone: function(gen1_options) {
                var rewrite, limit, self, cloneObject, cloneArray, cloneSubterm;
                rewrite = gen1_options && gen1_options.hasOwnProperty("rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : function(subterm) {
                    var self;
                    self = this;
                    return void 0;
                };
                limit = gen1_options && gen1_options.hasOwnProperty("limit") && gen1_options.limit !== void 0 ? gen1_options.limit : function(subterm) {
                    var self;
                    self = this;
                    return false;
                };
                self = this;
                cloneObject = function(originalTerm, allowRewrite) {
                    var rewrittenTerm;
                    rewrittenTerm = function() {
                        if (originalTerm instanceof term && allowRewrite) {
                            return rewrite(originalTerm);
                        } else {
                            return void 0;
                        }
                    }();
                    if (!rewrittenTerm) {
                        var t, member;
                        t = Object.create(Object.getPrototypeOf(originalTerm));
                        for (var member in originalTerm) {
                            (function(member) {
                                if (originalTerm.hasOwnProperty(member)) {
                                    t[member] = cloneSubterm(originalTerm[member], allowRewrite);
                                }
                            })(member);
                        }
                        return t;
                    } else {
                        if (!(rewrittenTerm instanceof term)) {
                            throw new Error("rewritten term not an instance of term");
                        }
                        rewrittenTerm.isDerivedFrom(originalTerm);
                        return rewrittenTerm;
                    }
                };
                cloneArray = function(terms, allowRewrite) {
                    return _.map(terms, function(term) {
                        return cloneSubterm(term, allowRewrite);
                    });
                };
                cloneSubterm = function(subterm, allowRewrite) {
                    if (subterm instanceof Array) {
                        return cloneArray(subterm, allowRewrite);
                    } else if (subterm instanceof Function) {
                        return subterm;
                    } else if (subterm instanceof Object) {
                        return cloneObject(subterm, allowRewrite && !limit(subterm));
                    } else {
                        return subterm;
                    }
                };
                return cloneSubterm(self, true);
            },
            isDerivedFrom: function(ancestorTerm) {
                var self;
                self = this;
                return self.setLocation(ancestorTerm.location());
            },
            children: function() {
                var self, children, addMember, addMembersInObject;
                self = this;
                children = [];
                addMember = function(member) {
                    if (member instanceof term) {
                        return children.push(member);
                    } else if (member instanceof Array) {
                        var gen2_items, gen3_i;
                        gen2_items = member;
                        for (gen3_i = 0; gen3_i < gen2_items.length; gen3_i++) {
                            var gen4_forResult;
                            gen4_forResult = void 0;
                            if (function(gen3_i) {
                                var item;
                                item = gen2_items[gen3_i];
                                addMember(item);
                            }(gen3_i)) {
                                return gen4_forResult;
                            }
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
            walkDescendants: function(walker, gen5_options) {
                var limit, self, walkChildren;
                limit = gen5_options && gen5_options.hasOwnProperty("limit") && gen5_options.limit !== void 0 ? gen5_options.limit : function() {
                    var self;
                    self = this;
                    return false;
                };
                self = this;
                walkChildren = function(term) {
                    var gen6_items, gen7_i;
                    gen6_items = term.children();
                    for (gen7_i = 0; gen7_i < gen6_items.length; gen7_i++) {
                        var gen8_forResult;
                        gen8_forResult = void 0;
                        if (function(gen7_i) {
                            var child;
                            child = gen6_items[gen7_i];
                            walker(child);
                            if (!limit(child)) {
                                walkChildren(child);
                            }
                        }(gen7_i)) {
                            return gen8_forResult;
                        }
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
            definitions: function() {
                var self;
                self = this;
                return [];
            },
            definitionName: function(scope) {
                var self;
                self = this;
                return void 0;
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
            }
        });
        termPrototype = new term;
        return {
            term: term,
            termPrototype: termPrototype
        };
    };
    module.exports.term = function(members, gen9_options) {
        var baseClass, self, withCodeGen;
        baseClass = gen9_options && gen9_options.hasOwnProperty("baseClass") && gen9_options.baseClass !== void 0 ? gen9_options.baseClass : function(cg) {
            var self;
            self = this;
            return cg.termClass;
        };
        self = this;
        return withCodeGen = function(cg) {
            var termSubclass, constructor;
            termSubclass = classExtending(baseClass(cg), members);
            return constructor = function() {
                var args, gen10_c;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                gen10_c = function() {
                    termSubclass.apply(this, args);
                };
                gen10_c.prototype = termSubclass.prototype;
                return new gen10_c;
            };
        };
    };
})).call(this);