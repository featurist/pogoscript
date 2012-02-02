jison parser = require 'jison':Parser
terms = require './codeGenerator/codeGenerator'
ms = require '../lib/memorystream'
create parser context = require './parserContext': create parser context
create dynamic lexer = require './dynamicLexer': create dynamic lexer
grammar = require './grammar.pogo': grammar

parser = new (jison parser @grammar)
jison lexer = parser:lexer

create parser! =
    dynamic lexer = create dynamic lexer, next lexer (jison lexer)
    parser context = create parser context, terms @terms

    parser context: lexer = dynamic lexer
    jison lexer: yy = parser context
    parser: yy = parser context
    parser: lexer = dynamic lexer
    
    parser

exports: parse @source =
    parser = create parser!
    parser: parse @source

exports: write parser to file @f =
    parser source = create parser? : generate?
    fs = require 'fs'
    fs: write file sync 'jisonParser.js' (parser source) 'utf-8'

exports: lex @source =
    tokens = []
    token = undefined
    lexer = create dynamic lexer, next lexer (jison lexer), source @source
    parser context = create parser context, terms @terms
    parser context: lexer = lexer
    jison lexer: yy = parser context
    
    token = lexer: lex!
    while @{token != 1}
        tokens: push ([lexer: yytext. parser: terminals_: @token. token])
        token = lexer: lex!

    tokens
