jison parser = require 'jison':Parser
terms = require './codeGenerator/codeGenerator'
ms = require '../lib/memorystream'
create parser context = require './parserContext': create parser context
create dynamic lexer = require './dynamicLexer': create dynamic lexer
grammar = require './grammar.pogo': grammar

parser = new (jison parser @grammar)
jison lexer = parser:lexer

create parser @terms =
    dynamic lexer = create dynamic lexer?
    yy = create parser context, terms @terms

    dynamic lexer:next lexer = jison lexer
    yy:lexer = dynamic lexer
    jison lexer:yy = yy
    parser:yy = yy
    parser:lexer = dynamic lexer
    
    parser

exports: parse @source =
    parser = create parser @terms
    parser: parse @source
