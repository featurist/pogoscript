path = require 'path'
fs = require 'fs'
script = require './pogoAssertions'
withArgsShouldOutput = script.withArgsShouldOutput
childProcess = require 'child_process'
net = require 'net'

describe 'pogo command'
    it "`process.argv` contains 'pogo', the name of the
         script executed, and the arguments from the command line"

        'console.log (process.argv)' withArgs ['one', 'two'] shouldOutput "[ 'pogo',
                                                                             '#(path.resolve '343111c34d666435dd7e88265c816cbfdbe68cd3.pogo')',
                                                                             'one',
                                                                             'two' ]"

    it "`__filename` should be the name of the script"
        'console.log (__filename)' withArgs [] shouldOutput (path.resolve "5be55a44c52f14d048d19c020fd913199ae2e61c.pogo")

    it "`__dirname` should be the name of the script"
        'console.log (__dirname)' withArgs [] shouldOutput (path.resolve ".")

    it "runs script files even if they don't use the .pogo extension"
        'console.log "hi"' withArgs [] shouldOutput 'hi' (scriptFilename: 'ascript')

    it "script can take same switches as pogo script, like --compile"
        'console.log (process.argv)' withArgs ['--compile'] shouldOutput "[ 'pogo',
                                                                            '#(path.resolve '343111c34d666435dd7e88265c816cbfdbe68cd3.pogo')',
                                                                            '--compile' ]"

writeFile (filename, content) =
    fs.writeFile ("#(__dirname)/#(filename)", content, ^)

expandPogoCommand (command) =
    if (r/^pogo( |$)/.test (command))
        pogo = __dirname + "/../../bin/pogo"

        command.replace r/^pogo/ (pogo)
    else
        command

runShim (command, callback) =
    expandedCommand = expandPogoCommand (command)
    childProcess.exec (expandedCommand, {cwd = __dirname}) @(error, stdout, stderr)
        callback (error, {stdout = stdout, stderr = stderr})

run (command) = runShim (command, ^)

describe 'pogo --compile'
    afterEach
        unlink "#(__dirname)/toCompile.pogo"!
        unlink "#(__dirname)/toCompile.js"!

    it 'can compile a script'
        writeFile "toCompile.pogo" "console.log 'hi'"!
        pogoOutput = run "pogo -c toCompile.pogo"!
        pogoOutput.stdout.should.equal ''
        pogoOutput.stderr.should.equal ''

        nodeOutput = run "node toCompile.js"!
        nodeOutput.stdout.should.equal "hi\n"
        nodeOutput.stderr.should.equal ''

(n)ms = n
(n)s = n * 1000

wait (milliseconds) =
    setTimeout (^, milliseconds)

unlink (file)! =
    try
        fs.unlink (file, ^)!
    catch (error)
        if (error.code != 'ENOENT')
            throw (error)

describe 'pogo --help'
    it 'prints out help'
        pogoOutput = run "pogo --help"!

        pogoOutput.stdout.should.match r/usage:/
        pogoOutput.stdout.should.match r/--compile/
        pogoOutput.stdout.should.match r/--watch/

describe 'pogo --compile --if-stale'
    beforeEach
        unlink "#(__dirname)/toCompile.pogo"!
        unlink "#(__dirname)/toCompile.js"!

    afterEach
        unlink "#(__dirname)/toCompile.pogo"!
        unlink "#(__dirname)/toCompile.js"!

    it 'compiles a pogo script if the js is missing'
        writeFile "toCompile.pogo" "console.log 'hi'"!
        pogoOutput = run "pogo -cs toCompile.pogo"!
        pogoOutput.stdout.should.equal "compiling toCompile.pogo => toCompile.js\n"
        pogoOutput.stderr.should.equal ''

        nodeOutput = run "node toCompile.js"!
        nodeOutput.stdout.should.equal "hi\n"
        nodeOutput.stderr.should.equal ''

    it 'compiles a pogo script if the js is out of date'
        writeFile "toCompile.js" "console.log('old')"!
        wait (1s)!
        writeFile "toCompile.pogo" "console.log 'new'"!

        pogoOutput = run "pogo -cs toCompile.pogo"!
        pogoOutput.stdout.should.equal "compiling toCompile.pogo => toCompile.js\n"
        pogoOutput.stderr.should.equal ''

        nodeOutput = run "node toCompile.js"!
        nodeOutput.stdout.should.equal "new\n"
        nodeOutput.stderr.should.equal ''

    it "doesn't recompile the js if it the pogo is older"
        writeFile "toCompile.pogo" "console.log 'pogo'"!
        wait (1s)!
        writeFile "toCompile.js" "console.log('js')"!

        pogoOutput = run "pogo -cs toCompile.pogo"!
        pogoOutput.stdout.should.equal ''
        pogoOutput.stderr.should.equal ''

        nodeOutput = run "node toCompile.js"!
        nodeOutput.stdout.should.equal "js\n"
        nodeOutput.stderr.should.equal ''

describe 'debugging'
    describe '--debug'
        this.timeout 3000

        it 'starts remote debugging'
            writeFile "toDebug.pogo" "console.log 'bug!'"!
            pogoOutput = run 'pogo --debug toDebug.pogo'!
            pogoOutput.stderr.should.equal "debugger listening on port 5858\n"
            pogoOutput.stdout.should.equal "bug!\n"

describe '`pogo` (interactive)'
    util = require 'util'

    pogoSession () =
        pogo = childProcess.spawn (expandPogoCommand 'pogo', []) {
            cwd = __dirname
            stdio = 'pipe'
        }

        handleResult = nil
        currentOutput = ''
        firstPrompt = true

        pogo.stdout.on 'data' @(data)
            out = data.toString ()
            currentOutput := currentOutput + out
            if (r/^> $/m.test (currentOutput))
                commandOutput = currentOutput.replace (r/\n?> $/, '')
                currentOutput := ''
                if (firstPrompt)
                    firstPrompt := false
                else
                    handleResult (commandOutput)

        pogo.stderr.on 'data' @(data)
            console.log 'error'
            console.log (data.toString ())

        {
            issue (command)! =
                handleResult (actualResult) :=
                    continuation ()

                pogo.stdin.write "#(command)\n"

            issue (command) andExpect (result)! =
                handleResult (actualResult) :=
                    actualResult.should.equal (result)
                    continuation ()

                pogo.stdin.write "#(command)\n"

            exit ()! =
                pogo.on 'exit' @(code)
                    continuation (nil, code)

                pogo.stdin.end ()
        }

    it 'evaluates a simple line of pogoscript'
        pogo = pogoSession ()
        pogo.issue '8' andExpect '8'!
        pogo.exit()!

    it 'variables are shared among different lines'
        pogo = pogoSession ()
        pogo.issue 'a = 8' andExpect '8'!
        pogo.issue 'a' andExpect '8'!
        pogo.exit()!

    it 'evaluates async operations'
        pogo = pogoSession ()
        pogo.issue 'a()! = 8' andExpect '[Function]'!
        pogo.issue 'a()!' andExpect '8'!
        pogo.exit()!

    it 'evaluates async assignments'
        pogo = pogoSession ()
        pogo.issue 'a()! = 8' andExpect '[Function]'!
        pogo.issue 'b = a()!' andExpect '8'!
        pogo.issue 'b' andExpect '8'!
        pogo.exit()!

    it 'evaluates async assignments properly'
        pogo = pogoSession ()
        pogo.issue 'a ()! = @{ setTimeout (^, 100), t = (@new Date).getTime (), console.log (t), {t = t} }'!
        pogo.issue 'b = a()!'!
        pogo.issue 'c = b'!
        pogo.issue 'c == b'!
        pogo.issue 'b = a()!'!
        pogo.issue 'c == b' andExpect 'false'!
        pogo.exit()!
