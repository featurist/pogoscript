should = require 'should'
compiler = require '../lib/parser/compiler'
util = require 'util'
_ = require 'underscore'

chomp (s) =
    s.to string ().replace r/\n$/ ''

exports.evaluate script (script) =
    printed items = []
    
    print (arg) =
        printed items.push (arg)
    
    compiler.evaluate (script, definitions: {print = print})
    
    _.map (printed items) @(item)
        util.inspect (item)
    .join "\n"

exports.(script) should output (expected output) =
    should.equal (chomp (exports.evaluate script (script)), chomp (expected output))

exports.evaluate async script (script, done) =
    printed items = []
    
    print (arg) =
        debugger
        printed items.push (arg)

    async (callback) =
        process.next tick (callback)

    return printed output (error) =
        debugger
        done (
            error
            _.map (printed items) @(item)
                util.inspect (item)
            .join "\n"
        )
    
    compiler.evaluate (script, definitions: {
        print = print
        done = return printed output
        async = async
    })
    

exports.async (script) should output (expected output, done) =
    exports.evaluate async script (script) @(error, result)
        if (error)
            done (error)
        else
            try
                should.equal (chomp (result), chomp (expected output))
                done ()
            catch (ex)
                done (ex)

exports.(script) should throw (expected error) =
    failed = false
    
    try
        exports.evaluate script (script)
        failed := true
    catch (ex)
        should.equal (ex.to string () , expected error)
    
    if (failed)
        should.fail "expected #(expected error)"
    
