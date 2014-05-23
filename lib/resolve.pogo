module.exports (terms) =
  resolve = terms.term {
    constructor (term) =
      self.isResolve = true
      self.term = term

      resolve = terms.methodCall (terms.promise(), ['resolve'], [self.term])
      self._methodCall = terms.methodCall (resolve, ['then'], [])
      self._onFulfilled = terms.functionCall (terms.onFulfilledFunction, [self._methodCall])

    generate (scope) =
      self._onFulfilled.generate (scope)

    makeAsyncCallWithCallback (onFulfilled, onRejected) =
      args = [
        onFulfilled @or terms.onFulfilledFunction
      ]
      self._methodCall.methodArguments = args
      self
  }

  @(term)
    asyncResult = terms.asyncResult ()

    terms.subStatements [
      terms.definition (
        asyncResult
        resolve (term)
        async: true
      )
      asyncResult
    ]
