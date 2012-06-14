module.exports (terms) = terms.term {
    constructor (name, shadow: false) =
        self.variable = name
        self.is variable = true
        self.shadow = shadow

    variable name () =
        self.cg.concat name (self.variable, escape: true)
  
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
}
