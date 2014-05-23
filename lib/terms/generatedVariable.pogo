codegenUtils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (name, tag: nil) =
        self.name = name
        self.isVariable = true
        self.genVar = nil
        self.tag = tag

    dontClone = true

    declare (scope) =
      if (self.tag)
        scope.define (self.canonicalName (scope)) withTag (self.tag)
      else
        scope.define (self.canonicalName (scope))

    generatedName (scope) =
        if (!self.genVar)
            self.genVar = scope.generateVariable (codegenUtils.concatName (self.name))

        self.genVar

    canonicalName (scope) =
        self.generatedName (scope)

    displayName () =
        self.name

    generate (scope) =
      if (self.tag)
        variable = scope.findTag (self.tag)

        if (variable)
          self.code (variable)
        else
          self.code (self.canonicalName (scope))
      else
        self.code (self.canonicalName (scope))

    generateTarget (args, ...) = self.generate (args, ...)
}
