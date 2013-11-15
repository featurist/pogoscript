module.exports (terms) = terms.term {
    constructor (target, source, async: false, shadow: false, assignment: false) =
        self.is definition = true
        self.target = target
        self.source = source
        self.is async = async
        self.shadow = shadow
        self.is assignment = assignment

    expression () =
        self
  
    hash entry () =
        self.cg.hash entry (self.target.hash entry field (), self.source)

    generate java script (buffer, scope) =
        self.target.generate java script target (buffer, scope)
        buffer.write ('=')
        self.source.generate java script (buffer, scope)
  
    define variables (variables) =
        name = self.target.canonical name (variables.scope)

        if (name)
            if (@not self.is assignment)
                if (variables.is (name) defined in this scope @and @not self.shadow)
                    terms.errors.add term (self) with message "variable #(self.target.display name ()) is already defined, use := to reassign it"
                else
                    variables.define (name)
            else if (@not variables.is (name) defined)
                terms.errors.add term (self) with message "variable #(self.target.display name ()) is not defined, use = to define it"

    make async with callback for result (create callback for result) =
        if (self.is async)
            callback = create callback for result (self.target)
            self.source.make async call with callback (callback)
}
