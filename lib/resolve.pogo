module.exports (terms) =
  resolve = terms.term {
    constructor (term) =
      self.isResolve = true
      self.term = term

      if (@not term.isNewPromise)
        self._resolve = terms.methodCall (terms.promise(), ['resolve'], [term])
      else
        self._resolve = term

      self._onFulfilled = terms.functionCall (terms.onFulfilledFunction, [self._resolve])

    generate (scope) =
      self._onFulfilled.generate (scope)

    makeAsyncCallWithCallback (onFulfilled, onRejected) =
      args = []

      if (onFulfilled @and onFulfilled != terms.onFulfilledFunction)
        args.push (onFulfilled)

      if (args.length > 0)
        self._then = terms.methodCall (self._resolve, ['then'], args)
        self._onFulfilled = terms.functionCall (terms.onFulfilledFunction, [self._then])

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
