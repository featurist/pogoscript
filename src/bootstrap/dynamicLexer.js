(function() {
    var self, createDynamicLexer;
    self = this;
    exports.createDynamicLexer = createDynamicLexer = function() {
        return object(function() {
            var self;
            self = this;
            self.tokens = [];
            self.lex = function() {
                var self, token;
                self = this;
                token = self.tokens.shift();
                if (token) {
                    self.yytext = token;
                    return token;
                } else {
                    token = self.nextLexer.lex();
                    self.yytext = self.nextLexer.yytext;
                    return token;
                }
            };
            return self.setInput = function(input) {
                var self;
                self = this;
                return self.nextLexer.setInput(input);
            };
        });
    };
})();