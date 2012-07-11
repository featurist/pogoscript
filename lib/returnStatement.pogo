module.exports (terms) = terms.term {
    constructor (expr, implicit: false) =
        self.is return = true
        self.expression = expr
        self.is implicit = implicit

    generate java script statement (buffer, scope) =
        if (self.expression)
            self.expression.generate java script return (buffer, scope)
        else
            buffer.write ('return;')

    generate java script return (args, ...) = self.generate java script statement (args, ...)
}
