cg = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require './assertions.pogo'

terms (subterms) ... =
    cg.term =>
        self.terms = subterms
        
        self.subterms 'terms'
        
branch (left, right) =
    cg.term =>
        self.left = left
        self.right = right
        
        self.subterms 'left' 'right'

leaf (name) =
    cg.term =>
        self.name = name

location (fl, ll, fc, lc) = {
    first_line = fl
    last_line = ll
    first_column = fc
    last_column = lc
}

describe 'term'
    it 'subterms'
        term = cg.term =>
            self.a = cg.identifier 'a'
            self.b = cg.identifier 'b'
            self.subterms 'a' 'b'
        
        (term.all subterms ()) should contain fields [
            {identifier 'a'}
            {identifier 'b'}
        ]

    describe 'rewriting'
        it 'can rewrite subterms'
            term = cg.term =>
                self.a = cg.identifier 'a'
                self.b = cg.identifier 'b'

                self.subterms 'a' 'b'

            term.rewrite @(term)
                if (term.is identifier && (term.identifier == 'b'))
                    cg.identifier 'z'

            (term) should contain fields {
                a {identifier 'a'}
                b {identifier 'z'}
            }

        it 'can rewrite subterms in lists'
            term = cg.term =>
                self.things = [cg.identifier 'a', cg.identifier 'b']

                self.subterms 'things'

            term.rewrite @(term)
                if (term.is identifier && (term.identifier == 'b'))
                    cg.identifier 'z'

            (term) should contain fields {
                things [{identifier 'a'}, {identifier 'z'}]
            }

        it "doesn't rewrite subterms that aren't objects"
            term = cg.term =>
                self.things = [cg.identifier 'a', null, nil, 0, 1.1, "one", ""]
                self.a = 6
                self.b = {x = 5}

                self.subterms 'things' 'a' 'b'

            terms rewritten = []

            term.rewrite @(term)
                terms rewritten.push (term)

            (terms rewritten) should contain fields [
                {identifier 'a'}
                {x = 5}
            ]

        it "rewrites lists of lists of terms"
            term = cg.term =>
                self.things = [cg.identifier 'a', [cg.identifier 'b', [cg.identifier 'c']]]

                self.subterms 'things'

            term.rewrite @(term)
                if (term.is identifier && (term.identifier == 'c'))
                    cg.identifier 'z'

            (term) should contain fields {
                things [{identifier 'a'}, [{identifier 'b'}, [{identifier 'z'}]]]
            }

        it 'rewrites deep into the graph'
            subterm = cg.term =>
                self.a = cg.identifier 'a'
                self.subterms 'a'

            term = cg.term =>
                self.thing = subterm
                self.subterms 'thing'

            term.rewrite @(term)
                if (term.is identifier && (term.identifier == 'a'))
                    cg.identifier 'z'

            (term) should contain fields {
                thing {
                    a = {identifier 'z'}
                }
            }

        it "doesn't rewrite beyond limit"
            subterm = cg.term =>
                self.is subterm = true
                self.a = cg.identifier 'a'
                self.subterms 'a'

            term = cg.term =>
                self.thing = subterm
                self.b = cg.identifier 'b'
                self.subterms 'thing' 'b'

            term.rewrite (limit (term) if: term.is subterm) @(term)
                if (term.is identifier)
                    cg.identifier 'z'

            (term) should contain fields {
                thing {
                    a = {identifier 'a'}
                }
                b = {identifier 'z'}
            }
    
    describe 'locations'
        it 'location'
            id = cg.loc (cg.identifier 'a', location 1 2 3 4)
            
            (id.location ()) should contain fields {
                first line 1
                last line 2
                first column 3
                last column 4
            }
        
        it 'subterm location'
            term = cg.term
                this.a = cg.loc (cg.identifier 'a', location 1 1 3 10)
                this.b = cg.loc (cg.identifier 'b', location 1 1 2 12)
                this.subterms 'a' 'b'

            (term.location ()) should contain fields {
                first line 1
                last line 1
                first column 2
                last column 12
            }
    
    it 'derived term'
        a = cg.loc (leaf 'a', location 1 1 2 8)
        b = cg.loc (leaf 'b', location 2 2 2 8)

        term = branch (a, b)
        c = term.derived term (leaf 'c')

        (c.location ()) should contain fields {
            first line 1
            last line 2
            first column 2
            last column 8
        }

    describe 'depth first walk'
        root = terms (branch (leaf 'a', leaf 'b'), branch (leaf 'c', branch (leaf 'd', leaf 'e')))
        
        it 'walks all terms depth first'
            leaf terms = []
        
            root.walk each subterm @(term)
                if (term.name)
                    leaf terms.push (term.name)

            (leaf terms) should contain fields ['a', 'b', 'c', 'd', 'e']

        it "doesn't walk undefined subterms"
            term = branch (leaf 'a', undefined)
            
            leaf terms = []
            
            term.walk each subterm @(term)
                leaf terms.push (term)
            
            (leaf terms) should contain fields [{name 'a'}]
