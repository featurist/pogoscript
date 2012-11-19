module.exports (terms) =
    scope (statement list) =
        if (statement list.length == 1)
            statement = statement list.0

            if (statement.is return)
                statement.expression
            else
                statement
        else
            statements = terms.async statements (statement list)
            terms.function call (terms.sub expression (terms.block ([], statements)), [], async: statements.is async)
