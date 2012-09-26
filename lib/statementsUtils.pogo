exports.serialise statements (statements) =
    serialised statements = []

    for (n = 0, n < statements.length, n = n + 1)
        statement = statements.(n)
        statement = statement.rewrite (
            rewrite (term, rewrite: nil):
                term.serialise sub statements (serialised statements, rewrite: rewrite)
                
            limit (term):
                term.is statements
        )

        serialised statements.push (statement)

    serialised statements
