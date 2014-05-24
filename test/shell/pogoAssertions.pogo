should = require 'chai'.should()
fs = require 'fs'
spawn = require 'child_process'.spawn
crypto = require 'crypto'

pogoBinary () =
  __dirname + "/../../bin/pogo"

filenameFor (script) =
  hash = crypto.createHash 'sha1'
  hash.update (script)
  hash.digest 'hex' + '.pogo'

chomp (s) =
  s.toString ().replace r/\n$/ ''

executeScript (script) withArgs (args, scriptFilename: filenameFor (script))! =
  promise @(result)
    fs.writeFile (scriptFilename, script)!

    pogo = spawn (pogoBinary (), [scriptFilename].concat (args))

    allOutput = ''

    pogo.stdout.setEncoding 'utf-8'
    pogo.stdout.on 'data' @(output)
      allOutput := allOutput + output

    pogo.on 'exit' @(code)
      fs.unlink (scriptFilename) @(code)
        result (allOutput)

exports.(script) withArgs (args) shouldOutput (expectedOutput, scriptFilename: nil)! =
  actualOutput = executeScript (script) withArgs (args, scriptFilename: scriptFilename)!
  should.equal (chomp (actualOutput), chomp (expectedOutput))
