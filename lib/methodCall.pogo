codegen utils = require './codegenUtils'

module.exports (terms) =
    method call term = terms.term {
        constructor (object, name, args, optional args) =
            self.is method call = true
            self.object = object
            self.name = name
            self.method arguments = args
            self.optional arguments = optional args
              
        generate java script (buffer, scope) =
            self.object.generate java script (buffer, scope)
            buffer.write ('.')
            buffer.write (codegen utils.concat name (self.name))
            buffer.write ('(')
            codegen utils.write to buffer with delimiter (codegen utils.args and optional args (self.cg, self.method arguments, self.optional arguments), ',', buffer, scope)
            buffer.write (')')
    }

    method call (object, name, args, optional args) =
        splatted args = terms.splat arguments (args, optional args)
  
        if (splatted args)
            object var = terms.generated variable ['o']
            terms.sub statements [
              terms.definition (objectVar, object)
              terms.methodCall (
                terms.field reference (objectVar, name)
                ['apply']
                [object var, splatted args]
              )
            ]
        else
            method call term (object, name, args, optional args)
