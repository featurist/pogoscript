module.exports (terms) =
    with expression term = terms.term {
        constructor (subject, statements) =
            self.isWith = true
            self.subject = subject
            self.statements = statements
      
        generate (scope) =
            self.code (
                'with('
                self.subject.generate (scope)
                '){'
                self.statements.generate statements (scope)
                '}'
            )
      
        generate statement (args, ...) = self.generate (args, ...)

        rewriteResultTermInto (returnTerm) = self
    }
    
    with expression (subject, statements) =
      with expression term (subject, statements)
