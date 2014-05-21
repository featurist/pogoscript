module.exports (terms) =
  @(term)
    promisifyFunction = terms.moduleConstants.defineAs (
      ['promisify']
      terms.javascript(asyncControl.promisify.toString())
    )

    terms.functionCall (
      promisifyFunction
      [
        terms.closure (
          [terms.callbackFunction]
          terms.statements [term]
        )
      ]
    )
