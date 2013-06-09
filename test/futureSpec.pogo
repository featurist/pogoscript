script = require './scriptAssertions'

async should output = script.async should output
should output = script.should output

describe 'futures'
    it 'can defer the result of an asynchronous call'
        async! 'x! = 5
                f = x?
                print (f!)
                done ()' should output '5'

    it 'can defer the result of an asynchronous method call'
        async! 'object = {
                    method! = 5
                }
                future = object.method?
                print (future!)
                done ()' should output '5'

    it 'can defer the result of an asynchronous index call'
        async! 'object = {
                    "method"! = 5
                }
                future = object."method"?
                print (future!)
                done ()' should output '5'
