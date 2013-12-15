module.exports (terms) = terms.term {
    constructor (expr) =
        self.is throw = true
        self.expression = expr

    generate java script statement (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write ('throw ')
            buffer.write (self.expression.generate (scope))
            buffer.write (';')

    rewrite result term into (return term) = self
}
