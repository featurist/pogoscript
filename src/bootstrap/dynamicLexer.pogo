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
            :yylloc = :next lexer:yylloc
            :yyleng = :next lexer:yyleng
            :yylineno = :next lexer:yylineno
            :match = :next lexer:match
            
            token
    
    :show position? =
        :next lexer:show position?
    
    :set input @input = :next lexer:set input @input
