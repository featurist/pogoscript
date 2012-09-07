codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (fun, args, optional args, async: false, pass this to apply: false) =
        self.is function call = true

        self.function = fun
        self.function arguments = args
        self.optional arguments = (optional args || [])
        self.splatted arguments = self.cg.splat arguments (args, optional args)
        self.pass this to apply = pass this to apply
        self.is async = async

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
        if (self.is async)
            async result = terms.generated variable (['async', 'result'])

            terms.sub statements [
                terms.definition (
                    async result
                    clone ()
                    async: true
                )
                async result
            ]
        else if (self.function.is variable)
            name = self.function.variable
            macro = self.cg.macros.find macro (name)
        
            if (macro)
                clone (macro (name, self.function arguments, self.optional arguments))

    make async call with result (variable, statements) =
        fc = self.clone ()
        fc.function arguments.push (terms.closure ([terms.generated variable ['error'], variable], terms.statements (statements)))
        fc
}
