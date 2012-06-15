module.exports (terms) = terms.term {
    constructor (target, source) =
        self.is definition = true
        self.target = target
        self.source = source

    expression () =
        self
  
    hash entry () =
        self.cg.hash entry (self.target.hash entry field (), self.source)

    generate java script (buffer, scope) =
        self.target.generate java script target (buffer, scope)
        buffer.write ('=')
        self.source.generate java script (buffer, scope)
  
    definitions (scope) =
        defs = []
        t = self.target.definition name (scope)
        if (t)
            defs.push (t)

        s = self.source.definitions (scope)
        defs.concat (s)
}
