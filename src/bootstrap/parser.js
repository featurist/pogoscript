(function() {
    var self, jisonParser, terms, ms, createParserContext, createDynamicLexer, grammar, createParser;
    self = this;
    jisonParser = require("jison").Parser;
    terms = require("./codeGenerator/codeGenerator");
    ms = require("../lib/memorystream");
    createParserContext = require("./parserContext").createParserContext;
    createDynamicLexer = require("./dynamicLexer").createDynamicLexer;
    grammar = require("./grammar").grammar;
    createParser = function(terms, grammar) {
        var parser, dynamicLexer, yy, jisonLexer;
        console.log("creating parser");
        parser = new jisonParser(grammar);
        dynamicLexer = createDynamicLexer();
        yy = createParserContext({
            terms: terms
        });
        jisonLexer = parser.lexer;
        dynamicLexer.nextLexer = jisonLexer;
        yy.lexer = dynamicLexer;
        jisonLexer.yy = yy;
        parser.yy = yy;
        parser.lexer = dynamicLexer;
        return parser;
    };
    exports.parse = function(source) {
        var self, parser;
        self = this;
        parser = createParser(terms, grammar);
        return parser.parse(source);
    };
})();