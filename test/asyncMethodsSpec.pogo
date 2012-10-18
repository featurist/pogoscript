should = require 'should'
script = require './scriptAssertions'
async should output = script.async should output

describe 'asynchronous methods'
    describe "methods that don't have async bodies, but are defined with the async operator"
        context 'when the method is defined on an existing object'
            it 'makes the method asynchronous anyway'
                async! 'o = {}
                        o.f!() = "result"

                        print (o.f!())

                        done ()' should output ("'result'")

        context 'when the method is defined on an exiting object, but with an indexer'
            it 'makes the method asynchronous anyway'
                async! 'o = {}
                        o."f"!() = "result"

                        print (o.f!())

                        done ()' should output ("'result'")

        context 'when the method is defined as part of the object expression'
            it 'makes the method asynchronous anyway'
                async! 'o = {
                            f!() = "result"
                        }

                        print (o.f!())

                        done ()' should output ("'result'")
