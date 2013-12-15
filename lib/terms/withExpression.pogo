module.exports (terms) =
    with expression term = terms.term {
        constructor (subject, statements) =
            self.isWith = true
            self.subject = subject
            self.statements = statements
      
        generate java script (buffer, scope) =
            self.code into buffer (buffer) @(buffer)
                buffer.write ('with(')
                buffer.write (self.subject.generate (scope))
                buffer.write ('){')
                buffer.write (self.statements.generate statements (scope))
                buffer.write ('}')
      
        generate statement (args, ...) = self.generate (args, ...)

        rewriteResultTermInto (returnTerm) = self
    }
    
    with expression (subject, statements) =
      with expression term (subject, statements)
