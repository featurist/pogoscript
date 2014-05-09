codegen utils = require './codegenUtils'
argument utils = require './argumentUtils'
async control = require '../asyncControl'

module.exports (terms) =
    method call term = terms.term {
        constructor (
            object
            name
            args
            optional arguments: []
            async: false
            originally async: false
            async callback argument: nil
        ) =
            self.is method call = true
            self.object = object
            self.name = name
            self.method arguments = args
            self.optional arguments = optional arguments
            self.is async = async
            self.originally async = originally async
            self.async callback argument = async callback argument

        generate (scope) =
            self.generate into buffer @(buffer)
                args = codegen utils.concat args (
                    self.method arguments
                    optional args: self.optional arguments
                    terms: terms
                    async callback arg: self.async callback argument
                )

                splatted arguments = terms.splat arguments (args)

                if (splatted arguments)
                    buffer.write (self.object.generate (scope))
                    buffer.write(".")
                    buffer.write (codegen utils.concat name (self.name))
                    buffer.write(".apply(")
                    buffer.write (self.object.generate (scope))
                    buffer.write(',')
                    buffer.write (splatted arguments.generate (scope))
                    buffer.write (')')
                else
                    buffer.write (self.object.generate (scope))
                    buffer.write ('.')
                    buffer.write (codegen utils.concat name (self.name))
                    buffer.write ('(')
                    codegen utils.write to buffer with delimiter (args, ',', buffer, scope)
                    buffer.write (')')

        make async call with callback (callback) =
            self.async callback argument = callback
            self
    }

    method call (
        object
        name
        args
        optional arguments: []
        async: false
        future: false
        originally async: false
        async callback argument: nil
        contains splat arguments: false
        promisify: false
    ) =
        splatted args = terms.splat arguments (args, optional arguments)
  
        if (splatted args @and @not contains splat arguments)
            object var = terms.generated variable ['o']
            terms.sub statements [
              terms.definition (object var, object)
              method call (
                object var
                name
                args
                async: async
                future: false
                async callback argument: nil
                contains splat arguments: true
              )
            ]
        else if (async)
            async result = terms.async result ()

            terms.sub statements [
                terms.definition (
                    async result
                    method call term (
                        object
                        name
                        args
                        optional arguments: optional arguments
                        async: async
                        originally async: true
                    )
                    async: true
                )
                async result
            ]
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
                  method call (
                     object
                     name
                     args
                     optional arguments: []
                     async: false
                     future: false
                     originally async: false
                     async callback argument: nil
                     contains splat arguments: false
                     promisify: true
                  )
                ]
              )
            ]
          )
        else if (future)
            future function =
                terms.module constants.define ['future'] as (
                    terms.javascript (async control.future.to string ())
                )

            return (
                terms.function call (
                    future function
                    [
                        terms.closure (
                            [terms.continuation function]
                            terms.statements [
                                method call term (
                                    object
                                    name
                                    args
                                    optional arguments: optional arguments
                                    originally async: true
                                    async callback argument: terms.continuation function
                                )
                            ]
                        )
                    ]
                )
            )
        else
            method call term (
                object
                name
                args
                optional arguments: optional arguments
                async: async
                originally async: originally async
                async callback argument: async callback argument
            )
