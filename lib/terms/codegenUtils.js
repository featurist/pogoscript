(function() {
    var self = this;
    var _, grammar, actualCharacters, nameSegmentRenderedInJavaScript, operatorRenderedInJavaScript, capitalise, reservedWords, escapeReservedWord;
    _ = require("underscore");
    grammar = require("../parser/grammar");
    exports.writeToBufferWithDelimiter = function(array, delimiter, buffer, scope) {
        var self = this;
        var writer, first;
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
        var self = this;
        var gen1_items, gen2_i, mapping;
        gen1_items = actualCharacters;
        for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
            mapping = gen1_items[gen2_i];
            s = s.replace(mapping[0], mapping[1]);
        }
        return "'" + s + "'";
    };
    exports.concatName = function(nameSegments, options) {
        var self = this;
        var name, n, segment;
        name = "";
        for (n = 0; n < nameSegments.length; ++n) {
            segment = nameSegments[n];
            name = name + nameSegmentRenderedInJavaScript(segment, n === 0);
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
        for (n = 0; n < operator.length; ++n) {
            javaScriptName = javaScriptName + "$" + operator.charCodeAt(n).toString(16);
        }
        return javaScriptName;
    };
    capitalise = function(s) {
        return s[0].toUpperCase() + s.substring(1);
    };
    reservedWords = {
        "class": true,
        "function": true,
        "else": true,
        "case": true,
        "switch": true
    };
    escapeReservedWord = function(word) {
        if (reservedWords.hasOwnProperty(word)) {
            return "$" + word;
        } else {
            return word;
        }
    };
    exports.concatArgs = function(args, gen3_options) {
        var self = this;
        var optionalArgs, asyncCallbackArg, terms;
        optionalArgs = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "optionalArgs") && gen3_options.optionalArgs !== void 0 ? gen3_options.optionalArgs : void 0;
        asyncCallbackArg = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "asyncCallbackArg") && gen3_options.asyncCallbackArg !== void 0 ? gen3_options.asyncCallbackArg : void 0;
        terms = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "terms") && gen3_options.terms !== void 0 ? gen3_options.terms : void 0;
        var a;
        a = args.slice();
        if (optionalArgs && optionalArgs.length > 0) {
            a.push(terms.hash(optionalArgs));
        }
        if (asyncCallbackArg) {
            a.push(asyncCallbackArg);
        }
        return a;
    };
    exports.normaliseOperatorName = function(name) {
        var self = this;
        var op, match;
        op = new RegExp("^@(" + grammar.identifier + ")$");
        match = op.exec(name);
        if (match) {
            return match[1];
        } else {
            return name;
        }
    };
    exports.definedVariables = function(scope) {
        var self = this;
        return {
            variables: [],
            scope: scope,
            define: function(variable) {
                var self = this;
                scope.define(variable);
                return self.variables.push(variable);
            },
            isDefined: function(variable) {
                var self = this;
                return scope.isDefined(variable);
            },
            isDefinedInThisScope: function(variable) {
                var self = this;
                return scope.isDefinedInThisScope(variable);
            },
            uniqueVariables: function() {
                var self = this;
                return _.uniq(self.variables);
            }
        };
    };
}).call(this);