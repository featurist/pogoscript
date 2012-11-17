codegen utils = require './codegenUtils'

module.exports (terms) =
    variable term = terms.term {
        constructor (name, location: nil) =
            self.variable = name
            self.is variable = true
            self.set location (location)

        canonical name () =
            codegen utils.concat name (self.variable, escape: true)

        display name () =
            self.variable.join ' '
      
        generate java script (buffer, scope) =
            buffer.write (this.canonical name ())
      
        generate java script target (args, ...) = self.generate java script (args, ...)
      
        hash entry field () =
            self.variable
      
        generate java script parameter (args, ...) = self.generate java script (args, ...)
      
        parameter () =
            self
    }

    variable (name, could be macro: true, location: nil) =
        v = variable term (name, location: location)

        if (could be macro)
            macro = terms.macros.find macro (name)
        
            if (macro)
                return (macro (v, name))

        v
