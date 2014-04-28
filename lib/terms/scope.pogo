module.exports (terms) =
    scope (statementList, alwaysGenerateFunction: false, variables: []) =
        if (statementList.length == 1 @and @not alwaysGenerateFunction)
            statement = statementList.0

            if (statement.isReturn)
                statement.expression
            else
                statement
        else
            statements = terms.asyncStatements (statementList)
            terms.functionCall (terms.subExpression (terms.block (variables, statements)), variables, async: statements.isAsync)
