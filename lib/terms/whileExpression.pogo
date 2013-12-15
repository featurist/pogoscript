asyncControl = require '../asyncControl'

module.exports (terms) =
    whileExpressionTerm = terms.term {
        constructor (condition, statements) =
            self.isWhile = true
            self.condition = condition
            self.statements = statements
      
        generate (scope) =
            self.code (
                'while('
                self.condition.generate (scope)
                '){'
                self.statements.generate statements (scope)
                '}'
            )
      
        generate statement (args, ...) = self.generate(args, ...)

        rewriteResultTermInto (returnTerm) = nil
    }

    whileExpression (condition, statements) =
        conditionStatements = terms.asyncStatements [condition]

        if (statements.isAsync || conditionStatements.isAsync)
            asyncWhileFunction =
                terms.moduleConstants.define ['async', 'while'] as (
                    terms.javascript (asyncControl.while.toString ())
                )

            terms.functionCall (
                asyncWhileFunction
                [
                    terms.argument utils.asyncify body (conditionStatements)
                    terms.argumentUtils.asyncifyBody (statements)
                ]
                async: true
            )
        else
            whileExpressionTerm (condition, statements)
