(function() {
    var self, createIndentStack;
    self = this;
    createIndentStack = require("./indentStack").createIndentStack;
    exports.createParserContext = function() {
        var createParserContext;
        return createParserContext = function(gen1_options) {
            var terms;
            terms = gen1_options && gen1_options.terms != null ? gen1_options.terms : undefined;
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
                self.unsetIndentation = function() {
                    var self;
                    self = this;
                    return self.indentStack.unsetIndentation();
                };
                self.indentation = function(text) {
                    var self, tokens;
                    self = this;
                    tokens = self.indentStack.tokensForNewLine(text);
                    return self.tokens(tokens);
                };
                return self.eof = function() {
                    var self;
                    self = this;
                    return self.tokens(self.indentStack.tokensForEof());
                };
            });
        };
    }();
})();