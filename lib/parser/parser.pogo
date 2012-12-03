ms = require '../../lib/memorystream'
create parser context = require './parserContext'.create parser context
create dynamic lexer = require './dynamicLexer'.create dynamic lexer
parser = require './jisonParser'.parser

jison lexer = parser.lexer

self.create parser (terms: terms) =
    
    {
        parse (source) =
            dynamic lexer = create dynamic lexer (next lexer: jison lexer)
            parser context = create parser context (terms: terms)

            parser context.lexer = dynamic lexer
            jison lexer.yy = parser context
            parser.yy = parser context
            parser.lexer = dynamic lexer
            parser.parse (source)

        errors = terms.errors

        lex (source) =
            tokens = []
            lexer = create dynamic lexer (next lexer: jison lexer, source: source)
            parser context = create parser context (terms: terms)
            parser context.lexer = lexer
            jison lexer.yy = parser context
            
            token index = lexer.lex ()
            while (token index != 1)
                token =
                    if (typeof (token index) == 'number')
                        parser.terminals_.(token index)
                    else if (token index == '')
                        undefined
                    else
                        token index

                text =
                    if (lexer.yytext == '')
                        undefined
                    else if (lexer.yytext == token)
                        undefined
                    else
                        lexer.yytext

                lexer token =
                    if (text)
                        [token, text]
                    else
                        [token]

                tokens.push (lexer token)
                token index := lexer.lex ()

            tokens
    }
