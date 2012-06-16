module.exports (terms) = terms.term {
    constructor (expr) =
        self.is return = true
        self.expression = expr

    generate java script statement (buffer, scope) =
        if (self.expression)
            self.expression.generate java script return (buffer, scope)
        else
            buffer.write ('return;')

    generate java script return (args, ...) = self.generate java script statement (args, ...)
}
