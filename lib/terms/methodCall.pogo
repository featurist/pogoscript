codegenUtils = require './codegenUtils'
argumentUtils = require './argumentUtils'
asyncControl = require '../asyncControl'
_ = require 'underscore'

module.exports (terms) =
    methodCallTerm = terms.term {
        constructor (
          object
          name
          args
          async: false
          originallyAsync: false
          asyncCallbackArgument: nil
        ) =
          self.isMethodCall = true
          self.object = object
          self.name = name
          self.methodArguments = terms.argumentUtils.positionalArguments(args)
          self.optionalArguments = terms.argumentUtils.optionalArguments(args)
          self.isAsync = async
          self.originallyAsync = originallyAsync
          self.asyncCallbackArgument = asyncCallbackArgument

        generate (scope) =
          self.generateIntoBuffer @(buffer)
            args = codegenUtils.concatArgs (
              self.methodArguments
              optionalArgs: self.optionalArguments
              terms: terms
              asyncCallbackArg: self.asyncCallbackArgument
            )

            splattedArguments = terms.splatArguments (args)

            if (splattedArguments)
              buffer.write (self.object.generate (scope))
              buffer.write(".")
              buffer.write (codegenUtils.concatName (self.name))
              buffer.write(".apply(")
              buffer.write (self.object.generate (scope))
              buffer.write(',')
              buffer.write (splattedArguments.generate (scope))
              buffer.write (')')
            else
              buffer.write (self.object.generate (scope))
              buffer.write ('.')
              buffer.write (codegenUtils.concatName (self.name))
              buffer.write ('(')
              codegenUtils.writeToBufferWithDelimiter (args, ',', buffer, scope)
              buffer.write (')')
    }

    methodCall (
      object
      name
      args
      async: false
      future: false
      originallyAsync: false
      asyncCallbackArgument: nil
      containsSplatArguments: false
      promisify: false
    ) =
      if (_.any(args) @(arg) @{ arg.isSplat } @and @not containsSplatArguments)
        objectVar = terms.generatedVariable ['o']
        terms.subStatements [
          terms.definition (objectVar, object)
          methodCall (
            objectVar
            name
            args
            async: async
            future: false
            asyncCallbackArgument: nil
            containsSplatArguments: true
          )
        ]
      else if (async)
        asyncResult = terms.asyncResult ()

        terms.subStatements [
          terms.definition (
            asyncResult
            methodCallTerm (
              object
              name
              args
              async: async
              originallyAsync: true
            )
            async: true
          )
          asyncResult
        ]
      else if (@not promisify @and [a <- args, a.isCallback, a].length > 0)
        @return terms.promisify (
          methodCall (
            object
            name
            args
            async: false
            future: false
            originallyAsync: false
            asyncCallbackArgument: nil
            containsSplatArguments: false
            promisify: true
          )
        )
      else
        methodCallTerm (
          object
          name
          args
          async: async
          originallyAsync: originallyAsync
          asyncCallbackArgument: asyncCallbackArgument
        )
