module.exports (terms) =
    moduleTerm = terms.term {
        constructor (statements, global: false, returnLastStatement: false, bodyStatements: nil) =
            self.statements = statements
            self.isModule = true
            self.global = global
            self.bodyStatements = (bodyStatements || statements)

            if (global)
                self.bodyStatements.makeDefinitionsGlobal ()

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
              errorVariable = terms.variable ['error']

              terms.function call (
                  terms.variable ['set', 'timeout']
                  [
                      terms.closure (
                          []
                          terms.statements [
                              terms.throw statement (error variable)
                          ]
                      )
                      terms.integer 0
                  ]
              )

              terms.methodCall (
                methodCall
                ['then']
                [
                  terms.nil ()
                  terms.closure (
                    [errorVariable]
                    terms.statements [
                      terms.functionCall (
                          terms.variable ['set', 'timeout']
                          [
                              terms.closure (
                                  []
                                  terms.statements [
                                      terms.throwStatement (errorVariable)
                                  ]
                              )
                              terms.integer 0
                          ]
                      )
                    ]
                  )
                ]
              )
            else
              methodCall

            moduleTerm (terms.statements [call], bodyStatements: statements, global: global)
        else
            moduleTerm (statements, global: global, returnLastStatement: returnLastStatement, bodyStatements: bodyStatements)
