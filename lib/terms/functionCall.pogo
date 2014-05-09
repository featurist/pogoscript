codegenUtils = require './codegenUtils'
argumentUtils = require './argumentUtils'
_ = require 'underscore'
asyncControl = require '../asyncControl'

module.exports (terms) =
    functionCallTerm = terms.term {
        constructor (
            fun
            args
            optionalArguments: []
            async: false
            passThisToApply: false
            originallyAsync: false
            asyncCallbackArgument: nil
        ) =
            self.isFunctionCall = true

            self.function = fun
            self.functionArguments = args
            self.optionalArguments = optionalArguments
            self.passThisToApply = passThisToApply
            self.isAsync = async
            self.originallyAsync = originallyAsync
            self.asyncCallbackArgument = asyncCallbackArgument

        hasSplatArguments () =
            _.any (self.functionArguments) @(arg)
                arg.isSplat
      
        generate (scope) =
            self.generateIntoBuffer @(buffer)
                buffer.write (self.function.generateFunction (scope))

                args = codegenUtils.concatArgs (
                    self.functionArguments
                    optionalArgs: self.optionalArguments
                    asyncCallbackArg: self.asyncCallbackArgument
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

        makeAsyncCallWithCallback (callback) =
            self.asyncCallbackArgument = callback
            self
    }

    functionCall (
        fun
        args
        optionalArguments: []
        async: false
        passThisToApply: false
        originallyAsync: false
        asyncCallbackArgument: nil
        couldBeMacro: true
        future: false
        promisify: false
    ) =
        if (async)
            asyncResult = terms.asyncResult ()

            return (
                terms.subStatements [
                    terms.definition (
                        asyncResult
                        functionCallTerm (
                            fun
                            args
                            optionalArguments: optionalArguments
                            passThisToApply: passThisToApply
                            originallyAsync: true
                            asyncCallbackArgument: asyncCallbackArgument
                        )
                        async: true
                    )
                    asyncResult
                ]
            )
        else if (future)
            futureFunction =
                terms.moduleConstants.define ['future'] as (
                    terms.javascript (asyncControl.future.toString ())
                )

            callback = terms.generatedVariable ['callback']

            return (
                terms.functionCall (
                    futureFunction
                    [
                        terms.closure (
                            [callback]
                            terms.statements [
                                terms.functionCall (
                                    fun
                                    args
                                    optionalArguments: optionalArguments
                                    passThisToApply: passThisToApply
                                    originallyAsync: true
                                    asyncCallbackArgument: callback
                                    couldBeMacro: couldBeMacro
                                )
                            ]
                        )
                    ]
                )
            )
        else if (@not promisify @and [a <- args, a.isCallback, a].length > 0)
          promisifyFunction = terms.moduleConstants.defineAs (
            ['promisify']
            terms.javascript(asyncControl.promisify.toString())
          )

          @return terms.functionCall (
            promisifyFunction
            [
              terms.closure (
                [terms.callbackFunction]
                terms.statements [
                  terms.functionCall (
                     fun
                     args
                     optionalArguments: []
                     async: false
                     passThisToApply: false
                     originallyAsync: false
                     asyncCallbackArgument: nil
                     couldBeMacro: true
                     future: false
                     promisify: true
                  )
                ]
              )
            ]
          )
        else if (fun.variable @and couldBeMacro)
            name = fun.variable
            macro = terms.macros.findMacro (name)
            funCall = functionCallTerm (fun, args, optionalArguments: optionalArguments)

            if (macro)
                return (macro (funCall, name, args, optionalArguments))

        functionCallTerm (
            fun
            args
            optionalArguments: optionalArguments
            passThisToApply: passThisToApply
            originallyAsync: originallyAsync
            asyncCallbackArgument: asyncCallbackArgument
        )
