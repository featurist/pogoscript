exports.serialiseStatements (statements) =
  serialisedStatements = []

  for (n = 0, n < statements.length, ++n)
    statement = statements.(n).rewrite (
      rewrite (term, rewrite: nil):
        term.serialiseSubStatements (serialisedStatements, rewrite: rewrite)
          
      limit (term):
        term.isStatements
    )

    serialisedStatements.push (statement)

  serialisedStatements

exports.definitions(statements) = [
  s <- statements
  @not s.isNewScope
  d <- s.definitions ()
  d
]
