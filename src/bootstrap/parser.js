((function() {
    var self, jisonParser, ms, createParserContext, createDynamicLexer, grammar, parser, jisonLexer;
    self = this;
    jisonParser = require("jison").Parser;
    ms = require("../../lib/memorystream");
    createParserContext = require("./parserContext").createParserContext;
    createDynamicLexer = require("./dynamicLexer").createDynamicLexer;
    grammar = require("./grammar").grammar;
    parser = new jisonParser(grammar);
    jisonLexer = parser.lexer;
    self.createParser = function(gen1_options) {
        var terms, self;
        terms = gen1_options && gen1_options.hasOwnProperty("terms") && gen1_options.terms !== void 0 ? gen1_options.terms : terms;
        self = this;
        return {
            parse: function(source) {
                var self, dynamicLexer, parserContext;
                self = this;
                dynamicLexer = createDynamicLexer({
                    nextLexer: jisonLexer
                });
                parserContext = createParserContext({
                    terms: terms
                });
                parserContext.lexer = dynamicLexer;
                jisonLexer.yy = parserContext;
                parser.yy = parserContext;
                parser.lexer = dynamicLexer;
                return parser.parse(source);
            },
            errors: terms.errors,
            lex: function(source) {
                var self, tokens, tokenIndex, lexer, parserContext, token, text, lexerToken;
                self = this;
                tokens = [];
                tokenIndex = undefined;
                lexer = createDynamicLexer({
                    nextLexer: jisonLexer,
                    source: source
                });
                parserContext = createParserContext({
                    terms: terms
                });
                parserContext.lexer = lexer;
                jisonLexer.yy = parserContext;
                tokenIndex = lexer.lex();
                while (tokenIndex !== 1) {
                    token = function() {
                        if (typeof tokenIndex === "number") {
                            return parser.terminals_[tokenIndex];
                        } else if (tokenIndex === "") {
                            return undefined;
                        } else {
                            return tokenIndex;
                        }
                    }();
                    text = function() {
                        if (lexer.yytext === "") {
                            return undefined;
                        } else if (lexer.yytext === token) {
                            return undefined;
                        } else {
                            return lexer.yytext;
                        }
                    }();
                    lexerToken = function() {
                        if (text) {
                            return [ token, text ];
                        } else {
                            return [ token ];
                        }
                    }();
                    tokens.push(lexerToken);
                    tokenIndex = lexer.lex();
                }
                return tokens;
            }
        };
    };
})).call(this);