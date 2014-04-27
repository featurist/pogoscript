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

        generateJavaScript (buffer, scope) =
            self.function.generateJavaScriptFunction (buffer, scope)

            args = codegenUtils.concatArgs (
                self.functionArguments
                optionalArgs: self.optionalArguments
                asyncCallbackArg: self.asyncCallbackArgument
                terms: terms
            )

            splattedArguments = self.cg.splatArguments (args)

            if (splattedArguments && self.function.isIndexer)
                buffer.write ('.apply(')
                self.function.object.generateJavaScript (buffer, scope)
                buffer.write (',')
                splattedArguments.generateJavaScript (buffer, scope)
                buffer.write (')')
            else if (splattedArguments)
                buffer.write ('.apply(')

                if (self.passThisToApply)
                    buffer.write ('this')
                else
                    buffer.write ('null')

                buffer.write (',')
                splattedArguments.generateJavaScript (buffer, scope)
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
    ) =
        if (async)
            asyncResult = terms.asyncResult ()

            terms.argumentUtils.asyncifyArguments (args, optionalArguments)

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
