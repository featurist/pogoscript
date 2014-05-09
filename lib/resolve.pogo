module.exports (terms) =
  @(term)
    terms.functionCall(terms.resolveFunction, [term], async: true)
