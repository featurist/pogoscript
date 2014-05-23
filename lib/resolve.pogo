module.exports (terms) =
  resolve = terms.term {
    constructor (term) =
      self.isResolve = true
      self.term = term

      if (@not term.isNewPromise)
        self._resolve = terms.methodCall (terms.promise(), ['resolve'], [term])
      else
        self._resolve = term

    generate (scope) =
      self._resolve.generate (scope)

    makeAsyncCallWithCallback (onFulfilled, onRejected) =
      args = []

      if (onFulfilled @and onFulfilled != terms.onFulfilledFunction)
        args.push (onFulfilled)

      if (args.length > 0)
        self._resolve = terms.methodCall (self._resolve, ['then'], args)

      self

    rewriteResultTermInto (returnTerm, async: false) =
      returnTerm (self._resolve)
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
