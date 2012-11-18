require './runtime'

exports.create indent stack = create indent stack () =
    object =>
        self.indents = [0]
        self.indentation regex = r/\r?\n( *)$/
        self.multi new line regex = r/\r?\n *\r?\n/
        
        self.is (text) multi new line =
            self.multi new line regex.test (text)
        
        self.(text) has new line () =
            self.indentation regex.test (text)
        
        self.indentation (new line) =
            self.indentation regex.exec (new line).1.length
        
        self.current indentation () =
            self.indents.0
        
        self.set indentation (text) =
            if (self.(text) has new line ())
                self.indents.unshift 'bracket'
                self.indents.unshift (self.indentation (text))
            else
                current = self.current indentation ()
                self.indents.unshift 'bracket'
                self.indents.unshift (current)
        
        self.unset indentation () =
            self.indents.shift ()

            tokens = []
            while ((self.indents.length > 0) && (self.indents.0 != 'bracket'))
                tokens.push '}'
                self.indents.shift ()
            
            self.indents.shift ()
            tokens
        
        self.tokens for eof () =
            tokens = []
            indents = self.indents.length

            while (indents > 1)
                tokens.push '}'
                --indents
            
            tokens.push 'eof'
        
            tokens
            
        
        self.tokens for new line (text) =
            if (self.(text) has new line ())
                current indentation = self.current indentation ()
                indentation = self.indentation (text)
        
                if (current indentation == indentation)
                    [',']
                else if (current indentation < indentation)
                    self.indents.unshift (indentation)
                    ['@{']
                else
                    tokens = []
                
                    while (self.indents.0 > indentation)
                        tokens.push '}'
                        self.indents.shift ()
                
                    if (self.is (text) multi new line)
                        tokens.push ','
                
                    if (self.indents.0 < indentation)
                        tokens.push '@{'
                        self.indents.unshift (indentation)
                
                    tokens
            else
                []
