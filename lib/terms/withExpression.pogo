module.exports (terms) =
    with expression term = terms.term {
        constructor (subject, statements) =
            self.isWith = true
            self.subject = subject
            self.statements = statements
      
        generateJavaScript (buffer, scope) =
            buffer.write ('with(')
            self.subject.generateJavaScript (buffer, scope)
            buffer.write ('){')
            self.statements.generateJavaScriptStatements (buffer, scope)
            buffer.write ('}')
      
        generateJavaScriptStatement (args, ...) = self.generateJavaScript (args, ...)

        rewriteResultTermInto (returnTerm) = self
    }
    
    with expression (subject, statements) =
      with expression term (subject, statements)