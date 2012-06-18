codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (name, shadow: false) =
        self.variable = name
        self.is variable = true
        self.shadow = shadow

    variable name () =
        codegen utils.concat name (self.variable, escape: true)
  
    generate java script (buffer, scope) =
        buffer.write (this.variable name ())
  
    generate java script target (args, ...) = self.generate java script (args, ...)
  
    hash entry field () =
        self.variable
  
    generate java script parameter (args, ...) = self.generate java script (args, ...)
  
    definition name (scope) =
        if (self.shadow || !scope.is defined (self.variable name()))
            this.variable name ()
  
    parameter () =
        self

    expand macro () =
        name = self.variable
        macro = self.cg.macros.find macro (name)
    
        if (macro)
            macro (name)
}
