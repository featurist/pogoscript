require './runtime'

exports: create indent stack = create indent stack! =
    object =>
        :indents = [0]
        :indentation regex = new (RegExp '\n( *)$')
        :multi new line regex = new (RegExp '\n *\n')
        
        :is @text multi new line =
            :multi new line regex: test @text
        
        : @text has new line? =
            :indentation regex: test @text
        
        :indentation (new line) =
            :indentation regex: exec (new line): 1: length
        
        :current indentation? =
            :indents: 0
        
        :set indentation @text =
            if (: @text has new line?)
                :indents:unshift (:indentation @text)
            else
                :indents:unshift (:current indentation?)
        
        :unset indentation! =
            :indents:shift!
        
        :tokens for eof? =
            tokens = []
            indents = :indents: length

            while (indents > 1)
                tokens: push '}'
                indents = indents - 1
            
            tokens: push 'eof'
        
            tokens
            
        
        :tokens for new line @text =
            if (:(text) has new line?)
                current indentation = :current indentation?
                indentation = :indentation @text
        
                if (current indentation == indentation)
                    ['.']
                else if (current indentation < indentation)
                    :indents: unshift @indentation
                    ['@{']
                else
                    tokens = []
                
                    while (:indents: 0 > indentation)
                        tokens: push '}'
                        :indents: shift!
                
                    if (:is @text multi new line)
                        tokens: push '.'
                
                    if (:indents: 0 < indentation)
                        tokens: push '@{'
                        :indents: unshift @indentation
                
                    tokens
            else
                []
