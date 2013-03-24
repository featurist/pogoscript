should = require 'should'
fs = require 'fs'
spawn = require 'child_process'.spawn
crypto = require 'crypto'

pogo binary () =
  __dirname + "/../../bin/pogo"

filename for (script) =
    hash = crypto.create hash 'sha1'
    hash.update (script)
    hash.digest 'hex' + '.pogo'

chomp (s) =
    s.to string ().replace r/\n$/ ''

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

exports.(script) with args (args) should output (expected output, done, script filename: nil) =
    execute script (script) with args (args, script filename: script filename) @(error, actual output)
        if (error)
            should.fail (error)
        else
            should.equal (chomp (actual output), chomp (expected output))

        done ()
