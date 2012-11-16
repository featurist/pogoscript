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
  
    declare variables (variables, scope) =
        if (@not self.is assignment)
            name = self.target.variable name (scope)

            if (name)
                if (self.shadow || !scope.is defined (name))
                    variables.push (name)
                else if (scope.is defined (name))
                    terms.errors.add term (self) with message "variable #(name) already defined, use := to reassign it"

    make async with callback for result (create callback for result) =
        if (self.is async)
            callback = create callback for result (self.target)
            self.source.make async call with callback (callback)
}
