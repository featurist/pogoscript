exports:create dynamic lexer = create dynamic lexer! = object =>
    :tokens = []
    
    :lex? =
        token = :tokens:shift?
        
        if @token
            :yytext = token
            token
        else
            token = :next lexer:lex?
            :yytext = :next lexer:yytext
            token
    
    :set input @input = :next lexer:set input @input
