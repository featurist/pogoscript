module.exports (terms) = terms.term {
    constructor (expression) =
        self.is sub expression = true
        self.expression = expression

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write ('(')
            buffer.write (self.expression.generate (scope))
            buffer.write (')')
}
