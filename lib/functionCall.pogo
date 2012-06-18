codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (fun, args, optional args) =
        self.is function call = true

        self.function = fun
        self.function arguments = args
        self.optional arguments = optionalArgs
        self.splatted arguments = self.cg.splat arguments (args, optional args)
        self.pass this to apply = false

    has splat arguments () =
        self.splatted arguments
  
    generate java script (buffer, scope) =
        self.function.generate java script (buffer, scope)
    
        args = codegen utils.args and optional args (self.cg, self.function arguments, self.optional arguments)
    
        if (self.splatted arguments && self.function.is indexer)
            buffer.write ('.apply(')
            self.function.object.generate java script (buffer, scope)
            buffer.write (',')
            self.splatted arguments.generate java script (buffer, scope)
            buffer.write (')')
        else if (self.splatted arguments)
            buffer.write ('.apply(')

            if (self.pass this to apply)
                buffer.write ('this')
            else
                buffer.write ('null')

            buffer.write (',')
            self.splatted arguments.generate java script (buffer, scope)
            buffer.write (')')
        else
            buffer.write ('(')
            codegen utils.write to buffer with delimiter (args, ',', buffer, scope)
            buffer.write (')')

    expand macro (clone) =
        if (self.function.is variable)
            name = self.function.variable
            macro = self.cg.macros.find macro (name)
        
            if (macro)
                macro (name, clone (self.function arguments), clone (self.optional arguments))
}
