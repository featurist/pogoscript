require './runtime'

exports: create indent stack = create indent stack! =
    peek @array = array: (array: length - 1)

    object =>
        :indents = [0]
        :indentation regex = new (RegExp '\n( *)$')
        
        :indentation (new line) =
            :indentation regex: exec (new line): 1: length
        
        :current indentation? =
            :indents: 0
        
        :tokens for eof? =
            tokens = []
            indents = :indents: length

            while @{indents > 1}
                tokens: push '}'
                indents = indents - 1
            
            tokens: push 'eof'
        
            tokens
            
        
        :tokens for new line @text =
            current indentation = :current indentation?
            indentation = :indentation @text
        
            if (current indentation == indentation)
                ['.']
            else if (current indentation < indentation)
                :indents: unshift @indentation
                ['@{']
            else
                tokens = []
                
                while @{:indents: 0 > indentation}
                    tokens: push '}'
                    :indents: shift!
                
                if (:indents: 0 < indentation)
                    tokens: push '@{'
                    :indents: unshift @indentation
                
                tokens
