codegenUtils = require './codegenUtils'
_ = require 'underscore'
asyncControl = require '../asyncControl'

module.exports (terms) =
    functionCallTerm = terms.term {
      constructor (
        fun
        args
        async: false
        passThisToApply: false
        options: false
      ) =
        self.isFunctionCall = true

        self.function = fun

        if (options)
          self.functionArguments = terms.argumentUtils.positionalArguments(args)
          self.optionalArguments = terms.argumentUtils.optionalArguments(args)
        else
          self.functionArguments = args

        self.passThisToApply = passThisToApply
        self.isAsync = async

      hasSplatArguments () =
        _.any (self.functionArguments) @(arg)
          arg.isSplat
    
      generate (scope) =
        self.generateIntoBuffer @(buffer)
          buffer.write (self.function.generateFunction (scope))

          args = codegenUtils.concatArgs (
            self.functionArguments
            optionalArgs: self.optionalArguments
            terms: terms
          )

          splattedArguments = self.cg.splatArguments (args)
      
          if (splattedArguments && self.function.isIndexer)
            buffer.write ('.apply(')
            buffer.write (self.function.object.generate (scope))
            buffer.write (',')
            buffer.write (splattedArguments.generate (scope))
            buffer.write (')')
          else if (splattedArguments)
            buffer.write ('.apply(')

            if (self.passThisToApply)
              buffer.write ('this')
            else
              buffer.write ('null')

            buffer.write (',')
            buffer.write (splattedArguments.generate (scope))
            buffer.write (')')
          else
            buffer.write ('(')
            codegenUtils.writeToBufferWithDelimiter (args, ',', buffer, scope)
            buffer.write (')')
    }

    functionCall (
      fun
      args
      passThisToApply: false
      couldBeMacro: true
      promisify: false
      options: false
    ) =
      if (@not promisify @and [a <- args, a.isCallback, a].length > 0)
        @return terms.promisify (
          terms.functionCall (
             fun
             args
             passThisToApply: false
             couldBeMacro: true
             promisify: true
             options: options
          )
        )
      else if (fun.variable @and couldBeMacro)
        name = fun.variable
        macro = terms.macros.findMacro (name)
        funCall = functionCallTerm (fun, args, options: options)

        if (macro)
          return (macro (funCall, name, args))

      functionCallTerm (
        fun
        args
        passThisToApply: passThisToApply
        options: options
      )
