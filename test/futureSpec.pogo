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
        async! 'o = {
                    x! = 5
                }
                f = o.x?
                print (f!)
                done ()' should output '5'
