codegen utils = require './codegenUtils'

module.exports (terms) =
    variable term = terms.term {
        constructor (name, location: nil) =
            self.variable = name
            self.is variable = true
            self.set location (location)

        variable name () =
            codegen utils.concat name (self.variable, escape: true)
      
        generate java script (buffer, scope) =
            buffer.write (this.variable name ())
      
        generate java script target (args, ...) = self.generate java script (args, ...)
      
        hash entry field () =
            self.variable
      
        generate java script parameter (args, ...) = self.generate java script (args, ...)
      
        parameter () =
            self

        expand macro () =
            name = self.variable
            macro = self.cg.macros.find macro (name)
        
            if (macro)
                macro (name)
    }

    variable (name, could be macro: true, location: nil) =
        if (could be macro)
            macro = terms.macros.find macro (name)
        
            if (macro)
                return (macro (name))

        variable term (name, location: location)
