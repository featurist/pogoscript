module.exports (terms) =
    scope (statements, always generate function) =
        if ((statements.length == 1) && !always generate function)
            statements.0
        else
            terms.function call (terms.sub expression (terms.block ([], terms.statements (statements))), [])
