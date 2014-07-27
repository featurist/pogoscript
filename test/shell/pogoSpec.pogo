path = require 'path'
fs = require 'fs'
script = require './pogoAssertions'
withArgsShouldOutput = script.withArgsShouldOutput
childProcess = require 'child_process'
net = require 'net'
require 'chai'.should()

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

write (content) toFile (filename) =
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
        write "console.log 'hi'" toFile "toCompile.pogo"!
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
        write "console.log 'hi'" toFile "toCompile.pogo"!
        pogoOutput = run "pogo -cs toCompile.pogo"!
        pogoOutput.stdout.should.equal "compiling toCompile.pogo => toCompile.js\n"
        pogoOutput.stderr.should.equal ''

        nodeOutput = run "node toCompile.js"!
        nodeOutput.stdout.should.equal "hi\n"
        nodeOutput.stderr.should.equal ''

    it 'compiles a pogo script if the js is out of date'
        write "console.log('old')" toFile "toCompile.js"!
        wait (1s)!
        write "console.log 'new'" toFile "toCompile.pogo"!

        pogoOutput = run "pogo -cs toCompile.pogo"!
        pogoOutput.stdout.should.equal "compiling toCompile.pogo => toCompile.js\n"
        pogoOutput.stderr.should.equal ''

        nodeOutput = run "node toCompile.js"!
        nodeOutput.stdout.should.equal "new\n"
        nodeOutput.stderr.should.equal ''

    it "doesn't recompile the js if it the pogo is older"
        write "console.log 'pogo'" toFile "toCompile.pogo"!
        wait (1s)!
        write "console.log('js')" toFile "toCompile.js"!

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
            write "console.log 'bug!'" toFile "toDebug.pogo"!
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
              promise @(success)
                handleResult (actualResult) :=
                  success()

                pogo.stdin.write "#(command)\n"

            issue (command) andExpect (result)! =
              promise @(success)
                handleResult (actualResult) :=
                  if (result :: RegExp)
                    actualResult.should.match (result)
                  else
                    actualResult.should.equal (result)

                  success ()

                pogo.stdin.write "#(command)\n"

            exit ()! =
              promise @(success)
                pogo.on 'exit' @(code)
                  success (code)

                pogo.stdin.end ()
        }

    it 'evaluates a simple line of pogoscript'
        pogo = pogoSession ()
        pogo.issue '8' andExpect '8'!
        pogo.exit()!

    it 'can continue in the face of syntax errors'
        pogo = pogoSession ()
        pogo.issue 'blah "' andExpect r/Expecting '\('/!
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

    it 'can require a local file'
      write "exports.x = 'x'" toFile "local.pogo"!
      pogo = pogoSession ()
      pogo.issue 'require "./local"' andExpect "{ x: 'x' }"!
      pogo.exit()!

describe 'pogo --promises'
  promisesTests (runPogoCommand) =
    it 'default is set to bluebird'
      source = "wait () = setTimeout ^ 1!
                bluebird = require 'bluebird'
                console.log (bluebird == Promise)"
      write (source) toFile "promiseTest.pogo"!
      output = runPogoCommand "promiseTest.pogo"!
      output.stdout.should.equal "true\n"

    it 'can be set to bluebird'
      source = "wait () = setTimeout ^ 1!
                bluebird = require 'bluebird'
                console.log (bluebird == Promise)"
      write (source) toFile "promiseTest.pogo"!
      output = runPogoCommand "--promises bluebird promiseTest.pogo"!
      output.stdout.should.equal "true\n"

    it 'can be set to something else'
      source = "wait () = setTimeout ^ 1!
                myPromiseLib = require './myPromiseLib'
                console.log (myPromiseLib == Promise)"
      write (source) toFile "promiseTest.pogo"!
      write 'module.exports = "my promise";'  toFile "myPromiseLib.js"!
      output = runPogoCommand "--promises ./myPromiseLib promiseTest.pogo"!
      output.stdout.should.equal "true\n"

    it 'can be set to none, using the global Promise'
      source = "wait () = setTimeout ^ 1!
                global.Promise = 'global promise'
                console.log ('global promise' == Promise)"
      write (source) toFile "promiseTest.pogo"!
      output = runPogoCommand "--promises none promiseTest.pogo"!
      output.stdout.should.equal "true\n"

  context 'when evaluating'
    promisesTests @(command)
      run "pogo #(command)"!

  context 'when compiling'
    promisesTests @(command)
      run "pogo -c #(command)"!
      run "node promiseTest.js"!
