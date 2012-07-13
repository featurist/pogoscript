module.exports (terms) = terms.term {
    constructor (test, statements) =
        self.is while = true
        self.test = test
        self.statements = statements
  
    generateJavaScript (buffer, scope) =
        buffer.write ('while(')
        self.test.generate java script (buffer, scope)
        buffer.write ('){')
        self.statements.generate java script statements (buffer, scope)
        buffer.write ('}')
  
    generate java script statement (args, ...) = self.generate java script (args, ...)
}
