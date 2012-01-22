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
                    self.yylloc = self.nextLexer.yylloc;
                    self.yyleng = self.nextLexer.yyleng;
                    self.yylineno = self.nextLexer.yylineno;
                    self.match = self.nextLexer.match;
                    return token;
                }
            };
            self.showPosition = function() {
                var self;
                self = this;
                return self.nextLexer.showPosition();
            };
            return self.setInput = function(input) {
                var self;
                self = this;
                return self.nextLexer.setInput(input);
            };
        });
    };
})();