module.exports (terms) =
  resolve = terms.term {
    constructor (term) =
      self.isResolve = true
      self.term = term

      self._resolve = term.promisify ()

    makeAsyncCallWithCallback (onFulfilled, onRejected) =
      args = []

      if (onFulfilled @and onFulfilled != terms.onFulfilledFunction)
        args.push (onFulfilled)

      if (args.length > 0)
        terms.methodCall (self._resolve, ['then'], args)
      else
        self._resolve
  }

  createResolve (term, alreadyPromise: false) =
    asyncResult = terms.asyncResult ()

    terms.subStatements [
      terms.definition (
        asyncResult
        resolve (term, alreadyPromise: alreadyPromise)
        async: true
      )
      asyncResult
    ]
