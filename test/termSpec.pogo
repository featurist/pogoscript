cg = require '../lib/parser/codeGenerator'.code generator ()
require './assertions'
Term = (require '../lib/terms/terms') {}.Term
_ = require 'underscore'
should = require 'should'

(actual list) should only have (expected list) =
    actual list.length.should.equal (expected list.length)

    for each @(item) in (expected list)
        _.include(actual list, item).should.be

/* terms:
  
   terms are objects (aka hashes)
   terms can contain arrays, numbers and strings, or other things, but
   only objects are terms.
  
   terms can have prototypes, in in fact prototypes are where terms
   get most of their behaviour.

   Terms can be cloned. This means that their prototype is copied,
   as well as any subterms (object fields). Arrays are copied too.

   Terms can have a location. And terms that derive from that term
   take a copy of that location, so they can be traced back to the
   originating source code.

   Terms can be derived from another term.

   Terms can be rewritten while they are cloned. Rewriting a term
   effectively derives the term's rewrite.
*/

describe 'terms'
    describe 'cloning'
        it 'creates a new object'
            t = new (Term)

            new term = t.clone ()

            new term.should.not.equal (t)

        it 'copies all members when cloning'
            t = new (Term)
            t.a = 1
            t.b = "b"

            clone = t.clone ()
            (clone) should contain fields {
                a = 1
                b = "b"
            }

        it 'arrays are also cloned'
            t = new (Term)
            t.array = [1]

            clone = t.clone ()
            
            clone.array.should.not.equal (t.array)
            (clone) should contain fields {
                array = [1]
            }

        it "an object's prototype is also copied"
            t = new (Term)
            t.a = 'a'

            clone = t.clone ()
            Object.get prototype of (clone).should.equal (Object.get prototype of (t))

        it "clones sub-objects"
            t = new (Term)
            t.a = {name = "jack"}

            clone = t.clone ()
            
            (clone) should contain fields {
                a = {name = "jack"}
            }

        it "doesn't clone objects that have 'dont clone' field"
            t = new (Term)
            t.a = {name = "jack"}
            t.dont clone = true

            clone = t.clone ()
            
            clone.should.equal (t)

        it "can rewrite an object while being cloned"
            t = new (Term)
            t.a = new (Term {name = "jack"})

            clone = t.clone (
                rewrite (old term):
                    if (old term.name)
                        new term = new (Term)
                        new term.name = "jill"
                        new term
            )
            
            (clone) should contain fields {
                a = {name = "jill"}
            }

        it "rewrite is passed the clone function, which can be used to clone further members"
            t = new (Term)
            t.a = new (Term {
                name = "jack"
                b = new (Term {
                    name = "john"
                })
            })

            clone = t.clone (
                rewrite (old term, clone: nil):
                    if (old term.name)
                        new term = new (Term)
                        new term.name = "jill"
                        
                        if (old term.b)
                            new term.b = clone (old term.b)

                        new term
            )
            
            (clone) should contain fields {
                a = {
                    name = "jill"
                    b = {name = "jill"}
                }
            }

        it "rewrite is passed the clone function, which can be used to clone the original node"
            t = new (Term)
            t.a = new (Term {
                name = "jack"
                b = new (Term {
                    name = "john"
                })
            })

            clone = t.clone (
                rewrite (old term, clone: nil):
                    if (old term.name)
                        new term = clone ()
                        new term.name = 'jill'
                        new term
            )
            
            (clone) should contain fields {
                a = {
                    name = "jill"
                    b = {name = "jill"}
                }
            }

        it "doesn't rewrite beyond rewrite limit"
            t = new (Term {
                a = new (Term {name = "jack"})
                b = new (Term {
                    is limit
                    c = new (Term {name = "jack"})
                })
                d = new (Term {name = "jason"})
            })

            clone = t.clone (
                rewrite (old term):
                    if (old term.name)
                        new (Term {name = "jill"})

                limit (t):
                    t.is limit
            )
            
            (clone) should contain fields {
                a = {name = "jill"}
                b = {
                    c = {name = "jack"}
                }
                d = {name = "jill"}
            }

        it "throws an exception when the new term is not an instance of 'term'"
            t = new (Term)
            t.a = new (Term {name = "jack"})

            @{t.clone (
                rewrite (old term):
                    if (old term.name)
                        {name = "jill"}
            )}.should.throw "rewritten node not an instance of Node"
            
        it 'copies the location when a term is rewritten'
            t = new (Term)
            t.set location {first line = 1, last line = 1, first column = 20, last column = 30}
            
            clone = t.clone (
                rewrite (old term): 
                    new term = new (Term)
                    new term.rewritten = true
                    new term
            )

            (clone) should contain fields {
                rewritten = true
            }
            (clone.location ()) should contain fields {
                first line = 1
                last line = 1
                first column = 20
                last column = 30
            }
            
        it 'passes path of terms to limit'
            c = new (Term)
            b = new (Term {
                c = c
            })
            a = new (Term {
                b = b
            })

            y = new (Term)
            x = new (Term {
                y = y
            })

            t = new (Term {
                a = a
                x = x
            })

            paths = []

            clone = t.clone (
                limit (old term, path: nil): 
                    paths.push (path.slice ())
                    false
            )

            (paths) should only have [
                []
                [t]
                [t, a]
                [t, a, b]
                [t, x]
                [t, x, y]
            ]
            
        it 'passes path of terms to rewrite'
            c = new (Term)
            b = new (Term {
                c = c
            })
            a = new (Term {
                b = b
            })

            y = new (Term)
            x = new (Term {
                y = y
            })

            t = new (Term {
                a = a
                x = x
            })

            paths = []

            clone = t.clone (
                rewrite (old term, path: nil): 
                    paths.push (path.slice ())
                    nil
            )

            (paths) should only have [
                []
                [t]
                [t, a]
                [t, a, b]
                [t, x]
                [t, x, y]
            ]

    describe 'rewriting'
        it 'returns the same object'
            a = new (Term {
                b = new (Term {
                    is crazy
                })
                c = new (Term {
                    is cool
                })
            })

            a.rewrite (
                rewrite (term):
                    if (term.is cool)
                        new (Term {is bad})
            )

            a.c.is bad.should.equal (true)

        it 'limits the rewrite to a term'
            a = new (Term {
                b = new (Term {
                    is crazy
                    d = new (Term {
                        is cool
                    })
                })
                c = new (Term {
                    is cool
                })
            })

            a.rewrite (
                rewrite (term):
                    if (term.is cool)
                        new (Term {is bad})

                limit (term):
                    term.is crazy
            )

            a.c.is bad.should.equal (true)
            a.b.d.is cool.should.equal (true)


    describe 'location'
        it 'can set location'
            t = new (Term)
            t.set location {first line = 1, last line = 2, first column = 20, last column = 30}

            (t.location ()) should contain fields {
                first line = 1
                last line = 2
                first column = 20
                last column = 30
            }

        it 'can compute location from children, first column is from first line, last column is from last line'
            left = new (Term)
            left.set location {first line = 1, last line = 2, first column = 20, last column = 30}

            right = new (Term)
            right.set location {first line = 2, last line = 4, first column = 30, last column = 10}

            t = new (Term {
                left = left
                right = right
            })

            (t.location ()) should contain fields {
                first line = 1
                last line = 4
                first column = 20
                last column = 10
            }

        it 'if there are no children then the location is nil'
            t = new (Term)

            should.(t.location ()) strict equal (nil)

        it 'if there are no children with locations then the location is nil'
            left = new (Term)
            right = new (Term)

            t = new (Term {
                left = left
                right = right
            })

            should.(t.location ()) strict equal (nil)

        it 'can compute location from children, smallest first column, largest last column when on same line'
            left = new (Term)
            left.set location {first line = 1, last line = 2, first column = 20, last column = 30}

            right = new (Term)
            right.set location {first line = 1, last line = 2, first column = 10, last column = 40}

            t = new (Term {
                left = left
                right = right
            })

            (t.location ()) should contain fields {
                first line = 1
                last line = 2
                first column = 10
                last column = 40
            }

    describe 'children'
        it 'returns immediate subterms'
            a = new (Term)
            b = new (Term)

            t = new (Term {
                a = a
                b = b
            })

            (t.children ()) should only have [a, b]

        it 'returns terms in arrays'
            a = new (Term)
            b = new (Term)

            t = new (Term {
                array = [a, b]
            })

            (t.children ()) should only have [a, b]

        it 'returns terms in objects'
            a = new (Term)
            b = new (Term)

            t = new (Term {
                object = {a = a, b = b}
            })

            (t.children ()) should only have [a, b]

        it "doesn't return members that start with _"
            a = new (Term)
            b = new (Term)

            t = new (Term {
                _member = a
                member = b
            })

            (t.children ()) should only have [b]

    describe 'walk descendants'
        it "walks descendants, children, children's children, etc"
            b = new (Term)
            c = new (Term)
            d = new (Term)
            a = new (Term {
                c = c
                d = [d]
            })

            t = new (Term {
                a = a
                b = b
            })

            descendants = []

            t.walk descendants @(subterm)
                descendants.push (subterm)

            (descendants) should only have [a, b, c, d]

        it "walks descendants, but not beyond the limit"
            b = new (Term)
            c = new (Term)
            d = new (Term)
            a = new (Term {
                is a
                c = c
                d = [d]
            })

            t = new (Term {
                a = a
                b = b
            })

            descendants = []

            t.walk descendants @(subterm)
                descendants.push (subterm)
            not below @(subterm) if
                subterm.is a

            (descendants) should only have [a, b]

        it "passes the path to the term to limit"
            b = new (Term {is b = true})
            c = new (Term {is c = true})
            d = new (Term {is d = true})
            a = new (Term {
                is a
                c = c
                d = [d]
            })

            t = new (Term {
                a = a
                b = b
            })

            descendants = []
            paths = []

            t.walk descendants @(subterm)
                nil
            not below @(subterm, path) if
                paths.push (path.slice ().concat [subterm])
                false

            (paths) should contain fields [
                [t, a]
                [t, a, c]
                [t, a, d]
                [t, b]
            ]

        it "passes the path to the term to the walker"
            b = new (Term {is b = true})
            c = new (Term {is c = true})
            d = new (Term {is d = true})
            a = new (Term {
                is a
                c = c
                d = [d]
            })

            t = new (Term {
                a = a
                b = b
            })

            descendants = []
            paths = []

            t.walk descendants @(subterm, path)
                paths.push (path.slice ().concat [subterm])
                nil
            not below @(subterm, path) if
                false

            (paths) should contain fields [
                [t, a]
                [t, a, c]
                [t, a, d]
                [t, b]
            ]

    describe 'reduce'
        it 'can be used to count total number of terms'
            t = new (Term {
                name = 't'
                a = new (Term {
                    name = 'a'
                    b = new (Term {name = 'b'})
                })
                x = [
                    new (Term {
                        name = 'u'
                        y = new (Term {name = 'y'})
                    })
                    new (Term {name = 'z'})
                ]
            })

            sum of (array) =
                sum = _.reduce (array) @(sum, i) @{ sum + i } (0)

            total term count = t.reduce @(term) with reduced children @(terms) into
                1 + sum of (terms)

            total term count.should.equal 6

        it 'reductions are cached, when given a cache name'
            t = new (Term {
                name = 't'
                a = new (Term {
                    name = 'a'
                    b = new (Term {name = 'b'})
                })
                x = [
                    new (Term {
                        name = 'u'
                        y = new (Term {name = 'y'})
                    })
                    new (Term {name = 'z'})
                ]
            })

            sum of (array) =
                sum = _.reduce (array) @(sum, i) @{ sum + i } (0)

            reduction count = 0

            total term count = t.reduce @(term) with reduced children @(terms) into
                ++reduction count
                1 + sum of (terms)
            (cache name: 'term count')

            first reduction count = reduction count

            t.reduce @(term) with reduced children @(terms) into
                ++reduction count
                1 + sum of (terms)
            (cache name: 'term count')

            reduction count.should.equal (first reduction count)
