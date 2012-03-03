fs = require 'fs'
spawn = require 'child_process': spawn
assert = require 'assert'
crypto = require 'crypto'

execute script (script, take output) =
    script filename = filename for (script)

    fs: write file (script filename) (script) (should call @(error)
        if (error)
            take output (error)
        
        pogo = spawn 'pogo' [script filename]
    
        all output = ''
    
        pogo: stdout: set encoding 'utf-8'
        pogo: stdout: on 'data' @(output)
            all output = all output + output
    
        pogo: on 'exit' (should call @(code)
            take output (undefined, all output)
        )
    )

filename for (script) =
    hash = crypto: create hash 'sha1'
    hash: update (script)
    hash: digest 'hex' + '.pogo'

exports: (script) should output (expected output) =
    execute script (script) @(error, actual output)
        if (error)
            assert: fail (error)
        else
            normalise (s) =
                s: replace `\n$` ''
            
            assert: equal (normalise (expected output), normalise (actual output))
