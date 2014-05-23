module.exports (terms) =
    moduleTerm = terms.term {
        constructor (statements, global: false, returnLastStatement: false, bodyStatements: nil) =
            self.statements = statements
            self.isModule = true
            self.global = global
            self.bodyStatements = (bodyStatements || statements)

        generateModule () =
            scope = new (terms.SymbolScope (nil))
            self.code (
                self.statements.generateStatements (scope, global: self.global, inClosure: true)
            )
    }

    module (statements, inScope: true, global: false, returnLastStatement: false, bodyStatements: bodyStatements) =
        if (returnLastStatement)
            statements.rewriteLastStatementToReturn (async: false)

        if (inScope)
            scope = terms.closure ([], statements, returnLastStatement: returnLastStatement, redefinesSelf: true, definesModuleConstants: true)
            args = [terms.variable (['this'])]

            methodCall = terms.methodCall (terms.subExpression (scope), ['call'], args)
            call = if (statements.isAsync)
              methodCall
            else
              methodCall

            moduleTerm (terms.statements [call], bodyStatements: statements, global: global)
        else
            moduleTerm (statements, global: global, returnLastStatement: returnLastStatement, bodyStatements: bodyStatements)
