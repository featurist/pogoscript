(function() {
    var self = this;
    var ms, createParserContext, createDynamicLexer, parser, jisonLexer;
    ms = require("../../lib/memorystream");
    createParserContext = require("./parserContext").createParserContext;
    createDynamicLexer = require("./dynamicLexer").createDynamicLexer;
    parser = require("./jisonParser").parser;
    jisonLexer = parser.lexer;
    self.createParser = function(gen1_options) {
        var self = this;
        var terms;
        terms = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "terms") && gen1_options.terms !== void 0 ? gen1_options.terms : terms;
        return {
            parse: function(source) {
                var self = this;
                var dynamicLexer, parserContext;
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
                var self = this;
                var tokens, lexer, parserContext, tokenIndex, token, text, lexerToken;
                tokens = [];
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
}).call(this);