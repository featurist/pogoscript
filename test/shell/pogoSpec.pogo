path = require 'path'
fs = require 'fs'
script = require '../scriptAssertions'
with args should output = script.with args should output
child process = require 'child_process'
net = require 'net'

describe 'pogo command'
    it "`process.argv` contains 'pogo', the name of the
         script executed, and the arguments from the command line" @(done)
    
        'console.log (process.argv)' with args ['one', 'two'] should output "[ 'pogo',
                                                                               '#(path.resolve '343111c34d666435dd7e88265c816cbfdbe68cd3.pogo')',
                                                                               'one',
                                                                               'two' ]" (done)

    it "`__filename` should be the name of the script" @(done)
        'console.log (__filename)' with args [] should output (path.resolve "5be55a44c52f14d048d19c020fd913199ae2e61c.pogo") (done)

    it "`__dirname` should be the name of the script" @(done)
        'console.log (__dirname)' with args [] should output (path.resolve ".") (done)
    
    it "runs script files even if they don't use the .pogo extension" @(done)
        'console.log "hi"' with args [] should output 'hi' (script filename: 'ascript', done)
    
    it "script can take same switches as pogo script, like --compile" @(done)
        'console.log (process.argv)' with args ['--compile'] should output "[ 'pogo',
                                                                              '#(path.resolve '343111c34d666435dd7e88265c816cbfdbe68cd3.pogo')',
                                                                              '--compile' ]" (done)

on success callback for (callback) =
    @(on success, always do)
        @(error, args, ...)
            if (error)
                callback (error)
            else
                on success (args, ...)

write file (filename, content, done) =
    fs.write file ("#(__dirname)/#(filename)", content, done)

expand pogo command (command) =
    if (r/^pogo /.test (command))
        pogo = __dirname + "/../../bin/pogo"

        command.replace r/^pogo/ (pogo)
    else
        command
    
spawn (command, args, done) =
    process = child process.spawn (expand pogo command (command), args, {cwd = __dirname, custom fds = [0, 1, 2]})
    done (nil, process)

run (command, done) =
    command = expand pogo command (command)
    child process.exec (command, {cwd = __dirname}, done)

describe 'pogo --compile'
    it 'can compile a script' @(done)
        on success = on success callback for (done)

        write file "toCompile.pogo" "console.log 'hi'" (on success
            run "pogo -c toCompile.pogo" (on success @(stdout, stderr)
                stdout.should.equal ''
                stderr.should.equal ''

                run "node toCompile.js" (on success @(stdout, stderr)
                    stdout.should.equal "hi\n"
                    stderr.should.equal ''

                    fs.unlink "#(__dirname)/toCompile.pogo"
                        fs.unlink "#(__dirname)/toCompile.js"
                            done ()
                )
            )
        )

(n)ms = n
(n)s = n * 1000

after (milliseconds, do something) =
    set timeout (do something, milliseconds)

describe 'pogo --compile --if-stale'
    it 'compiles a pogo script if the js is missing' @(done)
        on success = on success callback for (done)

        fs.unlink "#(__dirname)/toCompile.js"
            write file "toCompile.pogo" "console.log 'hi'" (on success
                run "pogo -cs toCompile.pogo" (on success @(stdout, stderr)
                    stdout.should.equal "compiling toCompile.pogo => toCompile.js\n"
                    stderr.should.equal ''

                    run "node toCompile.js" (on success @(stdout, stderr)
                        stdout.should.equal "hi\n"
                        stderr.should.equal ''

                        fs.unlink "#(__dirname)/toCompile.pogo"
                            fs.unlink "#(__dirname)/toCompile.js"
                                done ()
                    )
                )
            )

    it 'compiles a pogo script if the js is out of date' @(done)
        on success = on success callback for (done)

        write file "toCompile.js" "console.log('old')" (on success
            after (1s)
                write file "toCompile.pogo" "console.log 'new'" (on success
                    run "pogo -cs toCompile.pogo" (on success @(stdout, stderr)
                        stdout.should.equal "compiling toCompile.pogo => toCompile.js\n"
                        stderr.should.equal ''

                        run "node toCompile.js" (on success @(stdout, stderr)
                            stdout.should.equal "new\n"
                            stderr.should.equal ''

                            fs.unlink "#(__dirname)/toCompile.pogo"
                                fs.unlink "#(__dirname)/toCompile.js"
                                    done ()
                        )
                    )
                )
        )

    it "doesn't recompile the js if it the pogo is older" @(done)
        on success = on success callback for (done)

        write file "toCompile.pogo" "console.log 'pogo'" (on success
            after (1s)
                write file "toCompile.js" "console.log('js')" (on success
                    run "pogo -cs toCompile.pogo" (on success @(stdout, stderr)
                        stdout.should.equal ''
                        stderr.should.equal ''

                        run "node toCompile.js" (on success @(stdout, stderr)
                            stdout.should.equal "js\n"
                            stderr.should.equal ''

                            fs.unlink "#(__dirname)/toCompile.pogo"
                                fs.unlink "#(__dirname)/toCompile.js"
                                    done ()
                        )
                    )
                )
        )

describe 'debugging'
    describe '--debug'
        it 'starts remote debugging' @(done)
            on success = on success callback for (done)

            write file "toDebug.pogo" "console.log 'bug!'" (on success
                run 'pogo --debug toDebug.pogo' (on success @(stdout, stderr)
                    stderr.should.equal "debugger listening on port 5858\n"
                    stdout.should.equal "bug!\n"

                    done ()
                )
            )
