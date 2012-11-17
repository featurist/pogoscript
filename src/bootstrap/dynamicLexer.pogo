exports.create dynamic lexer = create dynamic lexer (next lexer: nil, source: nil) = object =>
    self.tokens = []
    self.next lexer = next lexer
    
    self.lex () =
        token = self.tokens.shift ()
        
        if (token)
            self.yytext = token
            token
        else
            token := self.next lexer.lex ()
            
            self.yytext = self.next lexer.yytext
            self.yylloc = self.next lexer.yylloc
            self.yyleng = self.next lexer.yyleng
            self.yylineno = self.next lexer.yylineno
            self.match = self.next lexer.match
            
            token
    
    self.show position () =
        self.next lexer.show position ()
    
    self.set input (input) =
        self.next lexer.set input (input)
    
    if (source)
        self.set input (source)
