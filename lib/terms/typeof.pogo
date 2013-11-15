module.exports (terms) = terms.term {
    constructor (expression, type) =
        self.is instance of = true
        self.expression = expression
        self.type = type
    
    generate java script (buffer, scope) =
        buffer.write "(typeof("
        this.expression.generate java script (buffer, scope)
        buffer.write ") === '#(this.type)')"
}
