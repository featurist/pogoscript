(function() {
    var self = this;
    var createDynamicLexer;
    exports.createDynamicLexer = createDynamicLexer = function(gen1_options) {
        var nextLexer, source;
        nextLexer = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "nextLexer") && gen1_options.nextLexer !== void 0 ? gen1_options.nextLexer : void 0;
        source = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "source") && gen1_options.source !== void 0 ? gen1_options.source : void 0;
        return object(function() {
            var self = this;
            self.tokens = [];
            self.nextLexer = nextLexer;
            self.lex = function() {
                var self = this;
                var token;
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
                var self = this;
                return self.nextLexer.showPosition();
            };
            self.setInput = function(input) {
                var self = this;
                return self.nextLexer.setInput(input);
            };
            if (source) {
                return self.setInput(source);
            }
        });
    };
}).call(this);