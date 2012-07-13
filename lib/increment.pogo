module.exports (terms) = terms.term {
    constructor (expr) =
        self.is increment = true
        self.expression = expr

    generate java script (buffer, scope) =
        buffer.write('++')
        self.expression.generate java script(buffer, scope)
}
