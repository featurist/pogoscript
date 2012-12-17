pogo = require '../lib/parser/compiler'
should = require 'should'

describe 'pogo'
    it 'can compile pogoscript'
        pogo.compile 'x'.should.equal '(function() {
                                           var self = this;
                                           x;
                                       }).call(this);'

    describe 'evaluate'
        it 'can evaluate pogoscript'
            should.equal (pogo.evaluate '6', 6)

        it 'can evaluate pogoscript without making globals'
            pogo.evaluate 'some pogo variable = 6'
            global.hasOwnProperty('somePogoVariable').should.equal (false)

        it 'can evaluate pogoscript and make globals'
            pogo.evaluate ('some pogo variable = 6', global: true)
            global.hasOwnProperty('somePogoVariable').should.equal (true)
            delete (global.some pogo variable)

        it 'can evaluate pogoscript and pass in a variable'
            pogo.evaluate ('2 * x', definitions: {x = 4}).should.equal 8

        it 'can evaluate async pogoscript' @(done)
            pogo.evaluate ('process.next tick! (), done ()', definitions: {done = done})
