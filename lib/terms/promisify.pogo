asyncControl = require '../asyncControl'

module.exports (terms) =
  @(term)
    terms.newPromise (
      statements: terms.statements [term] (returnsPromise: true)
    )
