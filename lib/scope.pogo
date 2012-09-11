module.exports (terms) =
    scope (statements, always generate function) =
        if ((statements.length == 1) && !always generate function)
            statement = statements.0

            if (statement.is return)
                statement.expression
            else
                statement
        else
            terms.function call (terms.sub expression (terms.block ([], terms.statements (statements))), [])
