module.exports (terms) = terms.term {
    constructor (expression, type) =
        self.is instance of = true
        self.expression = expression
        self.type = type
    
    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write "(typeof("
            buffer.write (self.expression.generate (scope))
            buffer.write ") === '#(self.type)')"
}
