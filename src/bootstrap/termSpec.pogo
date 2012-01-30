require 'cupoftea'
cg = require '../lib/codeGenerator'
cg new = require './codeGenerator/codeGenerator'
require './assertions.pogo'

spec 'term'
    spec 'subterms'
        term = cg: term =>
            :a = cg: identifier 'a'
            :b = cg: identifier 'b'
            :subterms 'a' 'b'
        
        (term: all subterms?) should contain fields [
            {identifier 'a'}
            {identifier 'b'}
        ]
    
    spec 'locations'
        location @fl @ll @fc @lc = {
            first_line @fl
            last_line @ll
            first_column @fc
            last_column @lc
        }
    
        spec 'location'
            id = cg new: loc (cg: identifier 'a') (location 1 2 3 4)
            
            (id: location?) should contain fields {
                first line 1
                last line 2
                first column 3
                last column 4
            }
        
        spec 'subterm location'
            term = cg: term
                this: a = cg new: loc (cg: identifier 'a') (location 1 1 3 10)
                this: b = cg new: loc (cg: identifier 'b') (location 1 1 2 12)
                this: subterms 'a' 'b'

            (term: location?) should contain fields {
                first line 1
                last line 1
                first column 2
                last column 12
            }

    spec 'depth first walk'
        terms @terms ... =
            cg: term =>
                :terms = terms
                
                :subterms 'terms'
                
        branch @left @right =
            cg: term =>
                :left = left
                :right = right
                
                :subterms 'left' 'right'
        
        leaf @name =
            cg: term =>
                :name = name
    
        root = terms (branch (leaf 'a') (leaf 'b')) (branch (leaf 'c') (branch (leaf 'd') (leaf 'e')))
        
        spec 'walks all terms depth first'
            leaf terms = []
        
            root: walk each subterm #term
                if (term: name)
                    leaf terms: push (term: name)

            (leaf terms) should contain fields ['a'. 'b'. 'c'. 'd'. 'e']

        spec "doesn't walk undefined subterms"
            term = branch (leaf 'a') @undefined
            
            leaf terms = []
            
            term: walk each subterm #term
                leaf terms: push @term
            
            (leaf terms) should contain fields [{name 'a'}]