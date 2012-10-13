codegen utils = require './codegenUtils'
argument utils = require './argumentUtils'

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

        generate java script (buffer, scope) =
            self.object.generate java script (buffer, scope)
            buffer.write ('.')
            buffer.write (codegen utils.concat name (self.name))
            buffer.write ('(')
            args = codegen utils.concat args (
                self.method arguments
                optional args: self.optional arguments
                terms: terms
                async callback arg: self.async callback argument
            )
            codegen utils.write to buffer with delimiter (args, ',', buffer, scope)
            buffer.write (')')

        make async call with callback (callback) =
            self.async callback argument = callback
            self
    }

    method call (object, name, args, optional arguments: [], async: false) =
        splatted args = terms.splat arguments (args, optional arguments)
  
        if (splatted args)
            object var = terms.generated variable ['o']
            terms.sub statements [
              terms.definition (objectVar, object)
              method call (
                terms.field reference (objectVar, name)
                ['apply']
                [object var, splatted args]
                nil
                async: async
              )
            ]
        else if (async)
            terms.argument utils.asyncify arguments (args, optional arguments)

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
        else
            method call term (object, name, args, optional arguments: optional arguments, async: async)
