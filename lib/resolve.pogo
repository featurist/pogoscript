module.exports (terms) =
  resolve = terms.term {
    constructor (term) =
      self.isResolve = true

      self.resolve = term.promisify ()

    makeAsyncCallWithCallback (onFulfilled, onRejected) =
      args = []

      if (onFulfilled @and onFulfilled != terms.onFulfilledFunction)
        args.push (onFulfilled)

      if (args.length > 0)
        terms.methodCall (self.resolve, ['then'], args)
      else
        self.resolve
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
