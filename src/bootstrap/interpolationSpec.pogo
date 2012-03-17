interpolation = require './interpolation'

(x) should be false =
    x:should:not:be:ok

(x) should be true =
    x:should:be:ok

describe 'interpolation'
    interpolation state = undefined

    before each
        interpolation state = interpolation: create interpolation!

    describe "the number of starts should be matched by the same number of stops"
        it "should not be interpolating if it interpolation hasn't been started"
            (interpolation state: interpolating?) should be false

        it "should be interpolating if it interpolation has been started"
            interpolation state: start interpolation!
            (interpolation state: interpolating?) should be true

        it "should not be interpolating if interpolation has been started, then stopped"
            interpolation state: start interpolation!
            interpolation state: stop interpolation!
            (interpolation state: interpolating?) should be false

        it "should not be interpolating if started twice and stopped twice"
            interpolation state: start interpolation!
            interpolation state: start interpolation!
            interpolation state: stop interpolation!
            interpolation state: stop interpolation!
            (interpolation state: interpolating?) should be false

        it "should be interpolating if started twice and stopped once"
            interpolation state: start interpolation!
            interpolation state: start interpolation!
            interpolation state: stop interpolation!
            (interpolation state: interpolating?) should be true

    describe "when there are more close brackets than open brackets, then interpolation is finished"
        before each
            interpolation state: start interpolation!
    
        it 'should be finished interpolation after a close bracket'
            interpolation state: close bracket!
            (interpolation state: finished interpolation?) should be true
    
        it 'should not be finished interpolation after an open, then close bracket'
            interpolation state: open bracket!
            interpolation state: close bracket!
            (interpolation state: finished interpolation?) should be false
    
        it 'should not be finished interpolation after a two opens, and two close brackets'
            interpolation state: open bracket!
            interpolation state: open bracket!
            interpolation state: close bracket!
            interpolation state: close bracket!
            (interpolation state: finished interpolation?) should be false
    
        it 'should be finished interpolation after a two opens, and three close brackets'
            interpolation state: open bracket!
            interpolation state: open bracket!
            interpolation state: close bracket!
            interpolation state: close bracket!
            interpolation state: close bracket!
            (interpolation state: finished interpolation?) should be true
    
    describe 'multiple interpolations.
              given the following scenario:
              
              "foo #(func ("bar #(x)"))"
    
              start interpolation, open bracket
              start inner interpolation
              close bracket, stop interpolation
              close bracket, close bracket
              stop interpolation'
        
        it 'should have stopped interpolation'
            interpolation state: start interpolation!
            interpolation state: open bracket!
            interpolation state: start interpolation!
            interpolation state: close bracket!
            (interpolation state: finished interpolation?) should be true
            interpolation state: stop interpolation!
            (interpolation state: interpolating?) should be true
            interpolation state: close bracket!
            interpolation state: close bracket!
            (interpolation state: finished interpolation?) should be true
            interpolation state: stop interpolation!
            (interpolation state: interpolating?) should be false
