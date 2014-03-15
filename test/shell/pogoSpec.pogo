path = require 'path'
fs = require 'fs'
script = require './pogoAssertions'
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

write file (filename, content, done) =
    fs.write file ("#(__dirname)/#(filename)", content, done)

expand pogo command (command) =
    if (r/^pogo( |$)/.test (command))
        pogo = __dirname + "/../../bin/pogo"

        command.replace r/^pogo/ (pogo)
    else
        command
    
spawn (command, args, done) =
    process = child process.spawn (expand pogo command (command), args, {cwd = __dirname, custom fds = [0, 1, 2]})
    done (nil, process)

run (command, callback) =
    expanded command = expand pogo command (command)
    child process.exec (expanded command, {cwd = __dirname}) @(error, stdout, stderr)
        callback (error, {stdout = stdout, stderr = stderr})

describe 'pogo --compile'
    after each
        fs.unlink! "#(__dirname)/toCompile.pogo"
        fs.unlink! "#(__dirname)/toCompile.js"

    it 'can compile a script'
        write file! "toCompile.pogo" "console.log 'hi'"
        pogo output = run! "pogo -c toCompile.pogo"
        pogo output.stdout.should.equal ''
        pogo output.stderr.should.equal ''

        node output = run! "node toCompile.js"
        node output.stdout.should.equal "hi\n"
        node output.stderr.should.equal ''

(n)ms = n
(n)s = n * 1000

wait (milliseconds, do something) =
    set timeout (do something, milliseconds)

unlink! (file) =
    try
        fs.unlink! (file)
    catch (error)
        if (error.code != 'ENOENT')
            throw (error)

        // bug #6, remove this
        nil

describe 'pogo --help'
    it 'prints out help'
        pogo output = run! "pogo --help"

        pogo output.stdout.should.match r/usage:/
        pogo output.stdout.should.match r/--compile/
        pogo output.stdout.should.match r/--watch/

describe 'pogo --compile --if-stale'
    before each
        unlink! "#(__dirname)/toCompile.pogo"
        unlink! "#(__dirname)/toCompile.js"

    after each
        unlink! "#(__dirname)/toCompile.pogo"
        unlink! "#(__dirname)/toCompile.js"

    it 'compiles a pogo script if the js is missing'
        write file! "toCompile.pogo" "console.log 'hi'"
        pogo output = run! "pogo -cs toCompile.pogo"
        pogo output.stdout.should.equal "compiling toCompile.pogo => toCompile.js\n"
        pogo output.stderr.should.equal ''

        node output = run! "node toCompile.js"
        node output.stdout.should.equal "hi\n"
        node output.stderr.should.equal ''

    it 'compiles a pogo script if the js is out of date'
        write file! "toCompile.js" "console.log('old')"
        wait! (1s)
        write file! "toCompile.pogo" "console.log 'new'"

        pogo output = run! "pogo -cs toCompile.pogo"
        pogo output.stdout.should.equal "compiling toCompile.pogo => toCompile.js\n"
        pogo output.stderr.should.equal ''

        node output = run! "node toCompile.js"
        node output.stdout.should.equal "new\n"
        node output.stderr.should.equal ''

    it "doesn't recompile the js if it the pogo is older"
        write file! "toCompile.pogo" "console.log 'pogo'"
        wait! (1s)
        write file! "toCompile.js" "console.log('js')"

        pogo output = run! "pogo -cs toCompile.pogo"
        pogo output.stdout.should.equal ''
        pogo output.stderr.should.equal ''

        node output = run! "node toCompile.js"
        node output.stdout.should.equal "js\n"
        node output.stderr.should.equal ''

describe 'debugging'
    describe '--debug'
        this.timeout 3000

        it 'starts remote debugging'
            write file! "toDebug.pogo" "console.log 'bug!'"
            pogo output = run! 'pogo --debug toDebug.pogo'
            pogo output.stderr.should.equal "debugger listening on port 5858\n"
            pogo output.stdout.should.equal "bug!\n"

describe '`pogo` (interactive)'
    util = require 'util'

    pogo session () =
        pogo = child process.spawn (expand pogo command 'pogo', []) {
            cwd = __dirname
            stdio = 'pipe'
        }

        handle result = nil
        current output = ''
        first prompt = true

        pogo.stdout.on 'data' @(data)
            out = data.to string ()
            current output := current output + out
            if (r/^> $/m.test (current output))
                command output = current output.replace (r/\n?> $/, '')
                current output := ''
                if (first prompt)
                    first prompt := false
                else
                    handle result (command output)

        pogo.stderr.on 'data' @(data)
            console.log 'error'
            console.log (data.to string ())

        {
            issue (command) and expect (result, done) =
                handle result (actual result) :=
                    actual result.should.equal (result)
                    done ()

                pogo.stdin.write "#(command)\n"

            exit (done) =
                pogo.on 'exit' @(code)
                    done (nil, code)

                pogo.stdin.end ()
        }

    it 'evaluates a simple line of pogoscript'
        pogo = pogo session ()
        pogo.issue '8' and expect! '8'
        pogo.exit!

    it 'variables are shared among different lines'
        pogo = pogo session ()
        pogo.issue 'a = 8' and expect! '8'
        pogo.issue 'a' and expect! '8'
        pogo.exit!

    it 'evaluates async operations'
        pogo = pogo session ()
        pogo.issue 'a! = 8' and expect! '[Function]'
        pogo.issue 'a!' and expect! '8'
        pogo.exit!
        
