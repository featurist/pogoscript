module.exports (terms) = terms.term {
  constructor (closure: nil, statements: nil, term: nil, callsFulfillOnReturn: true) =
    self.isNewPromise = true

    self._newPromise = terms.newOperator (
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

  generate (scope) =
    self._newPromise.generate (scope)

  promisify () = self
}
