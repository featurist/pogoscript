fs = require 'fs'
spawn = require 'child_process'.spawn
assert = require 'assert'
crypto = require 'crypto'
command line = require '../lib/parser/commandLine'
util = require 'util'
_ = require 'underscore'

pogo binary () =
  __dirname + "/../bin/pogo"

execute script (script) with args (args, callback, script filename: filename for (script)) =
    fs.write file (script filename, script) @(error)
        if (error)
            callback (error)
        
        pogo = spawn (pogo binary (), [script filename].concat (args))
    
        all output = ''
    
        pogo.stdout.set encoding 'utf-8'
        pogo.stdout.on 'data' @(output)
            all output := all output + output
    
        pogo.on 'exit' @(code)
            fs.unlink (script filename) @(code)
                callback (undefined, all output)

filename for (script) =
    hash = crypto.create hash 'sha1'
    hash.update (script)
    hash.digest 'hex' + '.pogo'

chomp (s) =
    s.to string ().replace r/\n$/ ''

exports.(script) with args (args) should output (expected output, done, script filename: nil) =
    execute script (script) with args (args, script filename: script filename) @(error, actual output)
        if (error)
            assert.fail (error)
        else
            assert.equal (chomp (actual output), chomp (expected output))
            
        done ()

exports.evaluate script (script) =
    printed items = []
    
    print (arg) =
        printed items.push (arg)
    
    command line.evaluate (script, definitions: {print = print})
    
    _.map (printed items) @(item)
        util.inspect (item)
    .join "\n"

exports.(script) should output (expected output) =
    assert.equal (chomp (exports.evaluate script (script)), chomp (expected output))

exports.evaluate async script (script, done) =
    printed items = []
    
    print (arg) =
        printed items.push (arg)

    async (callback) =
        process.next tick (callback)

    return printed output (error) =
        done (
            error
            _.map (printed items) @(item)
                util.inspect (item)
            .join "\n"
        )
    
    command line.evaluate (script, definitions: {
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
                assert.equal (chomp (result), chomp (expected output))
                done ()
            catch (ex)
                done (ex)

exports.(script) should throw (expected error) =
    failed = false
    
    try
        exports.evaluate script (script)
        failed := true
    catch (ex)
        assert.equal (ex.to string () , expected error)
    
    if (failed)
        assert.fail "expected #(expected error)"
    
