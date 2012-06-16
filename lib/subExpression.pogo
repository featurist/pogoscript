module.exports (terms) = terms.term {
    constructor (expression) =
        self.is sub expression = true
        self.expression = expression

    generate java script (buffer, scope) =
        buffer.write ('(')
        self.expression.generate java script (buffer, scope)
        buffer.write (')')
}
