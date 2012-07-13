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
        var self, gen1_items, gen2_i, mapping;
        self = this;
        gen1_items = actualCharacters;
        for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
            mapping = gen1_items[gen2_i];
            s = s.replace(mapping[0], mapping[1]);
        }
        return "'" + s + "'";
    };
    exports.concatName = function(nameSegments, options) {
        var self, name, n, segment;
        self = this;
        name = "";
        for (n = 0; n < nameSegments.length; n = n + 1) {
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
        for (n = 0; n < operator.length; n = n + 1) {
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
        "case": true
    };
    escapeReservedWord = function(word) {
        if (reservedWords.hasOwnProperty(word)) {
            return "$" + word;
        } else {
            return word;
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