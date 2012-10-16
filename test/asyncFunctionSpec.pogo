should = require 'should'
script = require './scriptAssertions'
async should output = script.async should output

describe 'asynchronous functions'
    describe 'function with one argument'
        it 'takes that argument when passed, and as nil when not'
            async! 'f!(url) = url

                    print (f!("url"))
                    print (f!())

                    done ()' should output ("'url'
                                             undefined")
            
    describe 'function with an optional argument'
        it 'takes the optional argument when specified, or the default when not'
            async! 'f!(name: "jack default") = name

                    print (f!(name: "jill specified"))
                    print (f!())

                    done ()' should output ("'jill specified'
                                             'jack default'")
            
    describe 'function with a normal and an optional argument'
        it 'takes both arguments when specified, or nil for the normal, and the default for the optional'
            async! 'f!(a, name: "jack default") = [a, name]

                    print (f!("a", name: "jill specified"))
                    print (f!("a"))
                    print (f!())

                    done ()' should output ("[ 'a', 'jill specified' ]
                                             [ 'a', 'jack default' ]
                                             [ undefined, 'jack default' ]")
            
    describe 'function with two arguments'
        it 'takes arguments when passed starting with the first one, or nil when not passed'
            async! 'f!(a, b) = [a, b]

                    print (f!("a", "b"))
                    print (f!("a"))
                    print (f!())

                    done ()' should output ("[ 'a', 'b' ]
                                             [ 'a', undefined ]
                                             [ undefined, undefined ]")
            
    describe 'function with a splat argument'
        it 'takes splat argument as a list'
            async! 'f!(a, ...) = a

                    print (f!("a", "b"))
                    print (f!("a"))
                    print (f!())

                    done ()' should output ("[ 'a', 'b' ]
                                             [ 'a' ]
                                             []")
            
    describe 'function with a normal argument and a splat argument'
        it 'takes the first argument if present, then the remaining arguments in a list'
            async! 'f!(a, b, ...) = [a, b]

                    print (f!("a", "b", "c"))
                    print (f!("a", "b"))
                    print (f!("a"))
                    print (f!())

                    done ()' should output ("[ 'a', [ 'b', 'c' ] ]
                                             [ 'a', [ 'b' ] ]
                                             [ 'a', [] ]
                                             [ undefined, [] ]")
            
    describe 'function with a normal argument and a splat argument, followed by another argument'
        it 'takes the first argument if present, then the remaining arguments in a list'
            async! 'f!(a, b, ... , c) = [a, b, c]

                    print (f!("a", "b", "c", "d"))
                    print (f!("a", "b", "c"))
                    print (f!("a", "b"))
                    print (f!("a"))
                    print (f!())

                    done ()' should output ("[ 'a', [ 'b', 'c' ], 'd' ]
                                             [ 'a', [ 'b' ], 'c' ]
                                             [ 'a', [], 'b' ]
                                             [ 'a', [], undefined ]
                                             [ undefined, [], undefined ]")
