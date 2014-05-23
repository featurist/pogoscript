should = require 'should'
compiler = require '../lib/parser/compiler'
util = require 'util'
_ = require 'underscore'

chomp (s) =
    s.toString ().replace r/\n$/ ''

exports.evaluateScript (script) =
  printedItems = []

  print (arg) =
    printedItems.push (arg)

  p (n) =
    process.nextTick ^!
    n

  r = compiler.evaluate (script, definitions: {print = print, require = require, p = p})

  collatePrintedItems() =
    _.map (printedItems) @(item)
        util.inspect (item)
    .join "\n"

  if (r @and (r.then :: Function))
    fork
      r!
      collatePrintedItems()
  else
    collatePrintedItems()

exports.(script) shouldOutput (expectedOutput) =
    assertion (result) = should.equal (chomp (result), chomp (expectedOutput))

    result = exports.evaluateScript (script)

    if (result @and (typeof (result.then) == 'function'))
        fork
          assertion (result!)
    else
        assertion (result)

exports.evaluateAsyncScript (script, done) =
    printedItems = []

    print (arg) =
        printedItems.push (arg)

    async (callback) =
        process.nextTick (callback)

    returnPrintedOutput (error) =
        done (
            error
            _.map (printedItems) @(item)
                util.inspect (item)
            .join "\n"
        )

    compiler.evaluate (script, definitions: {
        print = print
        done = returnPrintedOutput
        async = async
    })

exports.async (script) shouldOutput (expectedOutput, done) =
    exports.evaluateAsyncScript (script) @(error, result)
        if (error)
            done (error)
        else
            try
                should.equal (chomp (expectedOutput), chomp (result))
                done ()
            catch (ex)
                done (ex)

fork (block) =
  block ()

exports.(script) should throw (expected error) =
    failed = false
    
    try
        exports.evaluate script (script)
        failed := true
    catch (ex)
        should.equal (ex.to string () , expected error)
    
    if (failed)
        should.fail "expected #(expected error)"
    
