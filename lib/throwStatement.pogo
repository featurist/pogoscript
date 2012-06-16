module.exports (terms) = terms.term {
    constructor (expr) =
        self.is throw = true
        self.expression = expr

    generate java script statement (buffer, scope) =
      buffer.write ('throw ')
      self.expression.generateJavaScript (buffer, scope)
      buffer.write (';')

    generate java script return (args, ...) = self.generate java script statement (args, ...)
}
