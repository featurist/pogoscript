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

    promise (n) =
        process.nextTick ^!
        n

    r = compiler.evaluate (script, definitions: {print = print, require = require, promise = promise})

    collatePrintedItems() =
      _.map (printedItems) @(item)
          util.inspect (item)
      .join "\n"

    if (r @and (r.then :: Function))
      r!
      collatePrintedItems()
    else
      collatePrintedItems()

exports.(script) shouldOutput (expectedOutput) =
    assertion (result) = should.equal (chomp (result), chomp (expectedOutput))

    result = exports.evaluateScript (script)

    if (result @and (typeof (result.then) == 'function'))
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

(x) isPromise =
  x @and (x.then :: Function)

fork (block) =
  block ()

exports.(script) shouldThrow (expectedError) =
    failed = false
    
    promise = try
        console.log 'calling script'
        result = exports.evaluateScript (script)
        if ((result) isPromise)
          console.log 'we have promise'
          fork
            try
              console.log 'resolving result'
              result!
              failed = true
            catch (error)
              console.log "have error: #(error)"
              should.equal (error.toString(), expectedError)
        else
          failed := true
    catch (ex)
        should.equal (ex.toString (), expectedError)
    
    if (failed)
        should.fail "expected #(expectedError)"
    else
        promise
