module.exports (terms) = terms.term {
  constructor (expr, implicit: false) =
    self.isReturn = true
    self.expression = expr
    self.isImplicit = implicit

  generateStatement (scope) =
    self.generateIntoBuffer @(buffer)
      if (self.expression)
        buffer.write ('return ')
        buffer.write (self.expression.generate (scope))
        buffer.write (';')
      else
        buffer.write ('return;')

  rewriteResultTermInto (returnTerm, async: false) =
    if (async)
      arguments =
        if (self.expression)
          [self.expression]
        else
          []

      terms.functionCall (terms.onRejectedFunction, arguments)
    else
      self
}
