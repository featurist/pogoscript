((function() {
    var self, createIndentStack, createInterpolation;
    self = this;
    createIndentStack = require("./indentStack").createIndentStack;
    createInterpolation = require("./interpolation").createInterpolation;
    exports.createParserContext = createParserContext = function(gen1_options) {
        var terms;
        terms = gen1_options && gen1_options.terms != null ? gen1_options.terms : void 0;
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
            return self.interpolation = createInterpolation();
        });
    };
})).call(this);