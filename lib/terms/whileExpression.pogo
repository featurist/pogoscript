asyncControl = require '../asyncControl'

module.exports (terms) =
    whileExpressionTerm = terms.term {
        constructor (condition, statements) =
            self.isWhile = true
            self.condition = condition
            self.statements = statements
      
        generateJavaScript (buffer, scope) =
            buffer.write ('while(')
            self.condition.generateJavaScript (buffer, scope)
            buffer.write ('){')
            self.statements.generateJavaScriptStatements (buffer, scope)
            buffer.write ('}')
      
        generateJavaScriptStatement (args, ...) = self.generateJavaScript (args, ...)

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
