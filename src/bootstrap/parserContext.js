((function() {
    var self, _, createIndentStack, createInterpolation;
    self = this;
    _ = require("underscore");
    createIndentStack = require("./indentStack").createIndentStack;
    createInterpolation = require("./interpolation").createInterpolation;
    exports.createParserContext = createParserContext = function(gen1_options) {
        var terms;
        terms = gen1_options && gen1_options.hasOwnProperty("terms") && gen1_options.terms !== void 0 ? gen1_options.terms : void 0;
        return object(function() {
            var self;
            self = this;
            self.terms = terms;
            self.indentStack = createIndentStack();
            self.tokens = function(tokens) {
                var self;
                self = this;
                self.lexer.tokens = tokens;
                return tokens.shift();
            };
            self.setIndentation = function(text) {
                var self;
                self = this;
                return self.indentStack.setIndentation(text);
            };
            self.unsetIndentation = function(token) {
                var self, tokens;
                self = this;
                tokens = self.indentStack.unsetIndentation();
                tokens.push(token);
                return self.tokens(tokens);
            };
            self.indentation = function(text) {
                var self, tokens;
                self = this;
                tokens = self.indentStack.tokensForNewLine(text);
                return self.tokens(tokens);
            };
            self.eof = function() {
                var self;
                self = this;
                return self.tokens(self.indentStack.tokensForEof());
            };
            self.interpolation = createInterpolation();
            self.lexOperator = function(parserContext, op) {
                var self;
                self = this;
                if (/[?!][.;]/.test(op)) {
                    return parserContext.tokens([ op[0], op[1] ]);
                } else if (/^(=>|\.\.\.|@:|[#@:!?,.=;])$/.test(op)) {
                    return op;
                } else {
                    return "operator";
                }
            };
            self.loc = function(term, location) {
                var self, loc;
                self = this;
                loc = {
                    firstLine: location.first_line,
                    lastLine: location.last_line,
                    firstColumn: location.first_column,
                    lastColumn: location.last_column
                };
                term.location = function() {
                    var self;
                    self = this;
                    return loc;
                };
                return term;
            };
            self.unindentBy = function(string, columns) {
                var self, r;
                self = this;
                r = new RegExp("\\n {" + columns + "}", "g");
                return string.replace(r, "\n");
            };
            self.normaliseString = function(s) {
                var self;
                self = this;
                return s.substring(1, s.length - 1).replace(/''/g, "'");
            };
            self.parseRegExp = function(s) {
                var self, match;
                self = this;
                match = /^r\/((\n|.)*)\/([^\/]*)$/.exec(s);
                return {
                    pattern: match[1].replace(/\\\//g, "/").replace(/\n/, "\\n"),
                    options: match[3]
                };
            };
            self.actualCharacters = [ [ /\\\\/g, "\\" ], [ /\\b/g, "\b" ], [ /\\f/g, "\f" ], [ /\\n/g, "\n" ], [ /\\0/g, "\0" ], [ /\\r/g, "\r" ], [ /\\t/g, "\t" ], [ /\\v/g, "" ], [ /\\'/g, "'" ], [ /\\"/g, '"' ] ];
            self.normaliseInterpolatedString = function(s) {
                var self, gen2_items, gen3_i;
                self = this;
                gen2_items = self.actualCharacters;
                for (gen3_i = 0; gen3_i < gen2_items.length; gen3_i++) {
                    var gen4_forResult;
                    gen4_forResult = void 0;
                    if (function(gen3_i) {
                        var mapping;
                        mapping = gen2_items[gen3_i];
                        s = s.replace(mapping[0], mapping[1]);
                    }(gen3_i)) {
                        return gen4_forResult;
                    }
                }
                return s;
            };
            self.compressInterpolatedStringComponents = function(components) {
                var self, compressedComponents, lastString, gen5_items, gen6_i;
                self = this;
                compressedComponents = [];
                lastString = void 0;
                gen5_items = components;
                for (gen6_i = 0; gen6_i < gen5_items.length; gen6_i++) {
                    var gen7_forResult;
                    gen7_forResult = void 0;
                    if (function(gen6_i) {
                        var component;
                        component = gen5_items[gen6_i];
                        if (!lastString && component.isString) {
                            lastString = component;
                            compressedComponents.push(lastString);
                        } else if (lastString && component.isString) {
                            lastString.string = lastString.string + component.string;
                        } else {
                            lastString = void 0;
                            compressedComponents.push(component);
                        }
                    }(gen6_i)) {
                        return gen7_forResult;
                    }
                }
                return compressedComponents;
            };
            self.unindentStringComponentsBy = function(components, columns) {
                var self;
                self = this;
                return _.map(components, function(component) {
                    if (component.isString) {
                        return self.terms.string(self.unindentBy(component.string, columns));
                    } else {
                        return component;
                    }
                });
            };
            self.separateExpressionComponentsWithStrings = function(components) {
                var self, separatedComponents, lastComponentWasExpression, gen8_items, gen9_i;
                self = this;
                separatedComponents = [];
                lastComponentWasExpression = false;
                gen8_items = components;
                for (gen9_i = 0; gen9_i < gen8_items.length; gen9_i++) {
                    var gen10_forResult;
                    gen10_forResult = void 0;
                    if (function(gen9_i) {
                        var component;
                        component = gen8_items[gen9_i];
                        if (lastComponentWasExpression && !component.isString) {
                            separatedComponents.push(self.terms.string(""));
                        }
                        separatedComponents.push(component);
                        lastComponentWasExpression = !component.isString;
                    }(gen9_i)) {
                        return gen10_forResult;
                    }
                }
                return separatedComponents;
            };
            return self.normaliseStringComponentsUnindentingBy = function(components, indentColumns) {
                var self;
                self = this;
                return self.separateExpressionComponentsWithStrings(self.compressInterpolatedStringComponents(self.unindentStringComponentsBy(components, indentColumns)));
            };
        });
    };
})).call(this);