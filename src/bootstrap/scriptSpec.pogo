require 'cupoftea'
script = require './scriptAssertions.pogo'

spec 'script'
    spec 'method call'
        script: 'console: log 1' should output '1'
    
    spec 'new date'
        script: 'console: log 2' should output '2'
    
    spec 'new date 3'
        script: 'console: log 3' should output '4'
    
    spec 'stuff'
        set timeout (should call
            require 'assert': ok (5)
        ) 1000
