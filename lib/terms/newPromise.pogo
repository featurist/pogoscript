module.exports (terms) =
  newPromise (closure: nil, statements: nil, term: nil, callsFulfillOnReturn: true) =
    p = terms.newOperator (
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
    )

    p.isNewPromise = true
    p
