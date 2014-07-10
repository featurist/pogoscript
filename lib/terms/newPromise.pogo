module.exports (terms) =
  @(closure: nil, statements: nil, term: nil, callsFulfillOnReturn: true)
    terms.newOperator (
      terms.functionCall (
        terms.promise()
        [
          closure @or terms.closure (
            [
              terms.onFulfilledFunction
            ]
            statements @or terms.statements [term]
            isNewScope: false
            callsFulfillOnReturn: callsFulfillOnReturn
          )
        ]
      )
    ).alreadyPromise()
