module.exports (terms) = terms.term {
    constructor (expr) =
        self.is increment = true
        self.expression = expr

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write('++')
            buffer.write (self.expression.generate (scope))
}
