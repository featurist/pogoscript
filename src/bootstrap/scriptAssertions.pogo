fs = require 'fs'
spawn = require 'child_process': spawn
assert = require 'assert'
crypto = require 'crypto'
command line = require './commandLine'
util = require 'util'
_ = require 'underscore'

execute script (script) with args (args) (take output) =
    script filename = filename for (script)

    fs: write file (script filename) (script) (should call @(error)
        if (error)
            take output (error)
        
        pogo = spawn 'pogo' ([script filename]: concat (args))
    
        all output = ''
    
        pogo: stdout: set encoding 'utf-8'
        pogo: stdout: on 'data' @(output)
            all output = all output + output
    
        pogo: on 'exit' (should call @(code)
            fs: unlink (script filename) (should call @(code)
                take output (undefined, all output)
            )
        )
    )

filename for (script) =
    hash = crypto: create hash 'sha1'
    hash: update (script)
    hash: digest 'hex' + '.pogo'

chomp (s) =
    s: to string! : replace `\n$` ''

:(script) with args (args) should output (expected output) =
    execute script (script) with args (args) @(error, actual output)
        if (error)
            assert: fail (error)
        else
            assert: equal (chomp (expected output), chomp (actual output))

:evaluate script (script) =
    printed items = []
    
    print (arg) =
        printed items: push (arg)
    
    command line: evaluate (script); print (print)
    
    _: map (printed items) @(item)
        util: inspect (item)
    : join "\n"

:(script) should output (expected output) =
    assert: equal (chomp (exports: evaluate script (script)), chomp (expected output))

:(script) should throw (expected error) =
    failed = false
    
    try
        exports: evaluate script (script)
        failed = true
    catch @(ex)
        assert: equal (ex: to string! , expected error)
    
    if (failed)
        assert: fail "expected #(expected error)"
    
