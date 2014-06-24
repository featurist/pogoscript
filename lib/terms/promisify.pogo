asyncControl = require '../asyncControl'

module.exports (terms) = terms.term {
  constructor (term) =
    self.isPromisify = true

    terms.promise()

    self.promisifyFunction = terms.moduleConstants.defineAs (
      ['promisify']
      terms.javascript(asyncControl.promisify.toString())
    )

    self.term = term

  generate (scope) =
    terms.functionCall (
      self.promisifyFunction
      [
        terms.closure (
          [terms.callbackFunction]
          terms.statements [self.term]
        )
      ]
    ).generate (scope)

  promisify () = self
}
