asyncControl = require '../asyncControl'

module.exports (terms) =
    whileExpressionTerm = terms.term {
        constructor (condition, statements) =
            self.isWhile = true
            self.condition = condition
            self.statements = statements
      
        generate java script (buffer, scope) =
            self.code into buffer (buffer) @(buffer)
                buffer.write ('while(')
                buffer.write (self.condition.generate (scope))
                buffer.write ('){')
                buffer.write (self.statements.generate statements (scope))
                buffer.write ('}')
      
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
