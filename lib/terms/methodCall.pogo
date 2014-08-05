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
          asyncCallbackArgument: nil
          options: false
        ) =
          self.isMethodCall = true
          self.object = object
          self.name = name

          if (options)
            self.methodArguments = terms.argumentUtils.positionalArguments(args)
            self.optionalArguments = terms.argumentUtils.optionalArguments(args)
          else
            self.methodArguments = args

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
      asyncCallbackArgument: nil
      containsSplatArguments: false
      promisify: false
      options: false
    ) =
      if (_.any(args) @(arg) @{ arg.isSplat } @and @not containsSplatArguments)
        objectVar = terms.generatedVariable ['o']
        terms.subStatements [
          terms.definition (objectVar, object)
          methodCall (
            objectVar
            name
            args
            asyncCallbackArgument: nil
            containsSplatArguments: true
          )
        ]
      else if (@not promisify @and [a <- args, a.isCallback, a].length > 0)
        @return terms.promisify (
          methodCall (
            object
            name
            args
            asyncCallbackArgument: nil
            containsSplatArguments: false
            promisify: true
            options: options
          )
        )
      else
        methodCallTerm (
          object
          name
          args
          asyncCallbackArgument: asyncCallbackArgument
          options: options
        )
