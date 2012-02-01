(function() {
    var self, jisonParser, terms, ms, createParserContext, createDynamicLexer, grammar, parser, jisonLexer, createParser;
    self = this;
    jisonParser = require("jison").Parser;
    terms = require("./codeGenerator/codeGenerator");
    ms = require("../lib/memorystream");
    createParserContext = require("./parserContext").createParserContext;
    createDynamicLexer = require("./dynamicLexer").createDynamicLexer;
    grammar = require("./grammar").grammar;
    parser = new jisonParser(grammar);
    jisonLexer = parser.lexer;
    createParser = function() {
        var dynamicLexer, yy;
        dynamicLexer = createDynamicLexer();
        yy = createParserContext({
            terms: terms
        });
        dynamicLexer.nextLexer = jisonLexer;
        yy.lexer = dynamicLexer;
        jisonLexer.yy = yy;
        parser.yy = yy;
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
})();