codegen utils = require './codegenUtils'
argument utils = require './argumentUtils'

module.exports (terms) =
    method call term = terms.term {
        constructor (object, name, args, optional arguments: [], async: false) =
            self.is method call = true
            self.object = object
            self.name = name
            self.method arguments = args
            self.optional arguments = optional arguments
            self.is async = async
              
        generate java script (buffer, scope) =
            self.object.generate java script (buffer, scope)
            buffer.write ('.')
            buffer.write (codegen utils.concat name (self.name))
            buffer.write ('(')
            codegen utils.write to buffer with delimiter (codegen utils.args and optional args (self.cg, self.method arguments, self.optional arguments), ',', buffer, scope)
            buffer.write (')')

        make async call with callback (callback) =
            mc = self.clone ()
            mc.method arguments.push (callback)
            mc
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
            argument utils.asyncify arguments (args, optional arguments)

            async result = terms.async result ()

            terms.sub statements [
                terms.definition (
                    async result
                    method call term (object, name, args, optional arguments: optional arguments, async: async)
                    async: true
                )
                async result
            ]
        else
            method call term (object, name, args, optional arguments: optional arguments, async: async)
