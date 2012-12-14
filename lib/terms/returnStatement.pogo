module.exports (terms) = terms.term {
    constructor (expr, implicit: false) =
        self.is return = true
        self.expression = expr
        self.is implicit = implicit

    generate java script statement (buffer, scope) =
        if (self.expression)
            buffer.write ('return ')
            self.expression.generate java script (buffer, scope)
            buffer.write (';')
        else
            buffer.write ('return;')
    
    rewrite result term into (return term, async: false) =
        if (async)
            arguments =
                if (self.expression)
                    [terms.nil (), self.expression]
                else
                    []

            terms.function call (terms.callback function, arguments)
        else
            self
}
