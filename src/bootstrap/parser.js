(function() {
    var self, jisonParser, terms, ms, createParserContext, createDynamicLexer, grammar, parser, jisonLexer, createParser;
    self = this;
    jisonParser = require("jison").Parser;
    terms = require("./codeGenerator/codeGenerator");
    ms = require("../lib/memorystream");
    createParserContext = require("./parserContext").createParserContext;
    createDynamicLexer = require("./dynamicLexer").createDynamicLexer;
    grammar = require("./grammar.js").grammar;
    parser = new jisonParser(grammar);
    jisonLexer = parser.lexer;
    createParser = function() {
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
        return parser;
    };
    exports.parse = function(source) {
        var self;
        self = this;
        parser = createParser();
        return parser.parse(source);
    };
    exports.writeParserToFile = function(f) {
        var self, parserSource, fs;
        self = this;
        parserSource = createParser().generate();
        fs = require("fs");
        return fs.writeFileSync("jisonParser.js", parserSource, "utf-8");
    };
    exports.lex = function(source) {
        var self, tokens, token, lexer, parserContext;
        self = this;
        tokens = [];
        token = undefined;
        lexer = createDynamicLexer({
            nextLexer: jisonLexer,
            source: source
        });
        parserContext = createParserContext({
            terms: terms
        });
        parserContext.lexer = lexer;
        jisonLexer.yy = parserContext;
        token = lexer.lex();
        while (token != 1) {
            tokens.push([ lexer.yytext, parser.terminals_[token], token ]);
            token = lexer.lex();
        }
        return tokens;
    };
})();
