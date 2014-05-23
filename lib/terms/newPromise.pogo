module.exports (terms) =
  newPromise (closure: nil, statements: nil, term: nil) =
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
          )
        ]
      )
    )

    p.isNewPromise = true
    p
