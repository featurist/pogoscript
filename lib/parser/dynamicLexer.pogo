exports.create dynamic lexer = create dynamic lexer (next lexer: nil, source: nil) =
    lexer = {
        tokens = []
        next lexer = next lexer
        
        lex () =
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
        
        show position () =
            self.next lexer.show position ()
        
        set input (input) =
            self.next lexer.set input (input)
    }

    if (source)
        lexer.set input (source)
    
    lexer
