exports.serialise statements (statements) =
    serialised statements = []

    for (n = 0, n < statements.length, n = n + 1)
        statement = statements.(n)
        statement = statement.rewrite (
            rewrite (term):
                term.serialise sub statements (serialised statements)
                
            limit (term):
                term.is statements
        )

        serialised statements.push (statement)

    serialised statements
