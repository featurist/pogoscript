((function() {
    var self, _, actualCharacters, nameSegmentRenderedInJavaScript, operatorRenderedInJavaScript, capitalise, reservedWords, escapeReservedWord;
    self = this;
    _ = require("underscore");
    exports.writeToBufferWithDelimiter = function(array, delimiter, buffer, scope) {
        var self, writer, first;
        self = this;
        writer = void 0;
        if (scope instanceof Function) {
            writer = scope;
        } else {
            writer = function(item) {
                return item.generateJavaScript(buffer, scope);
            };
        }
        first = true;
        return _(array).each(function(item) {
            if (!first) {
                buffer.write(delimiter);
            }
            first = false;
            return writer(item);
        });
    };
    actualCharacters = [ [ /\\/g, "\\\\" ], [ new RegExp("\b"), "\\b" ], [ /\f/g, "\\f" ], [ /\n/g, "\\n" ], [ /\0/g, "\\0" ], [ /\r/g, "\\r" ], [ /\t/g, "\\t" ], [ /\v/g, "\\v" ], [ /'/g, "\\'" ], [ /"/g, '\\"' ] ];
    exports.formatJavaScriptString = function(s) {
        var self, gen1_items, gen2_i;
        self = this;
        gen1_items = actualCharacters;
        for (gen2_i = 0; gen2_i < gen1_items.length; gen2_i++) {
            var gen3_forResult;
            gen3_forResult = void 0;
            if (function(gen2_i) {
                var mapping;
                mapping = gen1_items[gen2_i];
                s = s.replace(mapping[0], mapping[1]);
            }(gen2_i)) {
                return gen3_forResult;
            }
        }
        return "'" + s + "'";
    };
    exports.concatName = function(nameSegments, options) {
        var self, name, n;
        self = this;
        name = "";
        for (n = 0; n < nameSegments.length; n = n + 1) {
            var gen4_forResult;
            gen4_forResult = void 0;
            if (function(n) {
                var segment;
                segment = nameSegments[n];
                name = name + nameSegmentRenderedInJavaScript(segment, n === 0);
            }(n)) {
                return gen4_forResult;
            }
        }
        if (options && options.hasOwnProperty("escape") && options.escape) {
            return escapeReservedWord(name);
        } else {
            return name;
        }
    };
    nameSegmentRenderedInJavaScript = function(nameSegment, isFirst) {
        if (/[_$a-zA-Z0-9]+/.test(nameSegment)) {
            if (isFirst) {
                return nameSegment;
            } else {
                return capitalise(nameSegment);
            }
        } else {
            return operatorRenderedInJavaScript(nameSegment);
        }
    };
    operatorRenderedInJavaScript = function(operator) {
        var javaScriptName, n;
        javaScriptName = "";
        for (n = 0; n < operator.length; n = n + 1) {
            var gen5_forResult;
            gen5_forResult = void 0;
            if (function(n) {
                javaScriptName = javaScriptName + "$" + operator.charCodeAt(n).toString(16);
            }(n)) {
                return gen5_forResult;
            }
        }
        return javaScriptName;
    };
    capitalise = function(s) {
        return s[0].toUpperCase() + s.substring(1);
    };
    reservedWords = {
        "class": true,
        "function": true
    };
    escapeReservedWord = function(word) {
        if (reservedWords.hasOwnProperty(word)) {
            return "$" + word;
        } else {
            return word;
        }
    };
    exports.splattedArguments = function(cg, args, optionalArgs) {
        var self, splatArgs, previousArgs, foundSplat, i;
        self = this;
        splatArgs = [];
        previousArgs = [];
        foundSplat = false;
        i = 0;
        while (i < args.length) {
            var current, next;
            current = args[i];
            next = args[i + 1];
            if (next && next.isSplat) {
                foundSplat = true;
                if (previousArgs.length > 0) {
                    splatArgs.push(cg.list(previousArgs));
                    previousArgs = [];
                }
                splatArgs.push(current);
                i = i + 1;
            } else if (current.isSplat) {
                cg.errors.addTermWithMessage(current, "splat keyword with no argument to splat");
            } else {
                previousArgs.push(current);
            }
            i = i + 1;
        }
        if (optionalArgs && optionalArgs.length > 0) {
            previousArgs.push(cg.hash(optionalArgs));
        }
        if (previousArgs.length > 0) {
            splatArgs.push(cg.list(previousArgs));
        }
        if (foundSplat) {
            return cg.oldTerm(function() {
                var self;
                self = this;
                return self.generateJavaScript = function(buffer, scope) {
                    var self;
                    self = this;
                    for (i = 0; i < splatArgs.length; i = i + 1) {
                        var gen6_forResult;
                        gen6_forResult = void 0;
                        if (function(i) {
                            var splattedArgument;
                            splattedArgument = splatArgs[i];
                            if (i === 0) {
                                splattedArgument.generateJavaScript(buffer, scope);
                            } else {
                                buffer.write(".concat(");
                                splattedArgument.generateJavaScript(buffer, scope);
                                buffer.write(")");
                            }
                        }(i)) {
                            return gen6_forResult;
                        }
                    }
                };
            });
        }
    };
    exports.argsAndOptionalArgs = function(cg, args, optionalArgs) {
        var self, a;
        self = this;
        a = args.slice();
        if (optionalArgs && optionalArgs.length > 0) {
            a.push(cg.hash(optionalArgs));
        }
        return a;
    };
})).call(this);