((function() {
    var self, createIndentStack, createInterpolation;
    self = this;
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
            self.unindent = function(columns, string) {
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
            return self.normaliseInterpolatedString = function(s) {
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
        });
    };
})).call(this);