(function() {
    var self = this;
    var _, createIndentStack, createInterpolation, createParserContext;
    _ = require("underscore");
    createIndentStack = require("./indentStack").createIndentStack;
    createInterpolation = require("./interpolation").createInterpolation;
    exports.createParserContext = createParserContext = function(gen1_options) {
        var terms;
        terms = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "terms") && gen1_options.terms !== void 0 ? gen1_options.terms : void 0;
        return object(function() {
            var self = this;
            self.terms = terms;
            self.indentStack = createIndentStack();
            self.tokens = function(tokens) {
                var self = this;
                self.lexer.tokens = tokens;
                return tokens.shift();
            };
            self.setIndentation = function(text) {
                var self = this;
                return self.indentStack.setIndentation(text);
            };
            self.unsetIndentation = function(token) {
                var self = this;
                var tokens;
                tokens = self.indentStack.unsetIndentation();
                tokens.push(token);
                return self.tokens(tokens);
            };
            self.indentation = function(text) {
                var self = this;
                var tokens;
                tokens = self.indentStack.tokensForNewLine(text);
                return self.tokens(tokens);
            };
            self.eof = function() {
                var self = this;
                return self.tokens(self.indentStack.tokensForEof());
            };
            self.interpolation = createInterpolation();
            self.lexOperator = function(parserContext, op) {
                var self = this;
                if (/[?!][.;]/.test(op)) {
                    return parserContext.tokens([ op[0], op[1] ]);
                } else if (/^(=>|\.\.\.|@:|[#@:!?,.=;]|:=)$/.test(op)) {
                    return op;
                } else {
                    return "operator";
                }
            };
            self.loc = function(term, location) {
                var self = this;
                var loc;
                loc = {
                    firstLine: location.first_line,
                    lastLine: location.last_line,
                    firstColumn: location.first_column,
                    lastColumn: location.last_column
                };
                term.location = function() {
                    var self = this;
                    return loc;
                };
                return term;
            };
            self.unindentBy = function(string, columns) {
                var self = this;
                var r;
                r = new RegExp("\\n {" + columns + "}", "g");
                return string.replace(r, "\n");
            };
            self.normaliseString = function(s) {
                var self = this;
                return s.substring(1, s.length - 1).replace(/''/g, "'");
            };
            self.parseRegExp = function(s) {
                var self = this;
                var match;
                match = /^r\/((\n|.)*)\/([^\/]*)$/.exec(s);
                return {
                    pattern: match[1].replace(/\\\//g, "/").replace(/\n/, "\\n"),
                    options: match[3]
                };
            };
            self.actualCharacters = [ [ /\\\\/g, "\\" ], [ /\\b/g, "\b" ], [ /\\f/g, "\f" ], [ /\\n/g, "\n" ], [ /\\0/g, "\0" ], [ /\\r/g, "\r" ], [ /\\t/g, "	" ], [ /\\v/g, "" ], [ /\\'/g, "'" ], [ /\\"/g, '"' ] ];
            self.normaliseInterpolatedString = function(s) {
                var self = this;
                var gen2_items, gen3_i, mapping;
                gen2_items = self.actualCharacters;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    mapping = gen2_items[gen3_i];
                    s = s.replace(mapping[0], mapping[1]);
                }
                return s;
            };
            self.compressInterpolatedStringComponents = function(components) {
                var self = this;
                var compressedComponents, lastString, gen4_items, gen5_i, component;
                compressedComponents = [];
                lastString = void 0;
                gen4_items = components;
                for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                    component = gen4_items[gen5_i];
                    if (!lastString && component.isString) {
                        lastString = component;
                        compressedComponents.push(lastString);
                    } else if (lastString && component.isString) {
                        lastString.string = lastString.string + component.string;
                    } else {
                        lastString = void 0;
                        compressedComponents.push(component);
                    }
                }
                return compressedComponents;
            };
            self.unindentStringComponentsBy = function(components, columns) {
                var self = this;
                return _.map(components, function(component) {
                    if (component.isString) {
                        return self.terms.string(self.unindentBy(component.string, columns));
                    } else {
                        return component;
                    }
                });
            };
            self.separateExpressionComponentsWithStrings = function(components) {
                var self = this;
                var separatedComponents, lastComponentWasExpression, gen6_items, gen7_i, component;
                separatedComponents = [];
                lastComponentWasExpression = false;
                gen6_items = components;
                for (gen7_i = 0; gen7_i < gen6_items.length; ++gen7_i) {
                    component = gen6_items[gen7_i];
                    if (lastComponentWasExpression && !component.isString) {
                        separatedComponents.push(self.terms.string(""));
                    }
                    separatedComponents.push(component);
                    lastComponentWasExpression = !component.isString;
                }
                return separatedComponents;
            };
            return self.normaliseStringComponentsUnindentingBy = function(components, indentColumns) {
                var self = this;
                return self.separateExpressionComponentsWithStrings(self.compressInterpolatedStringComponents(self.unindentStringComponentsBy(components, indentColumns)));
            };
        });
    };
}).call(this);