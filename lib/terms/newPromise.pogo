module.exports (terms) =
  @(closure: nil, statements: nil, term: nil, callsFulfillOnReturn: true)
    if (statements @and statements.statements.length == 1)
      statements.statements.0.promisify()
    else
      terms.newOperator (
        terms.functionCall (
          terms.promise()
          [
            closure @or terms.closure (
              [
                terms.onFulfilledFunction
              ]
              statements @or terms.statements [term]
              inPromise: true
              callsFulfillOnReturn: callsFulfillOnReturn
            )
          ]
        )
      ).alreadyPromise()
