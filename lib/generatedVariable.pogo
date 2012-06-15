codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (name) =
        self.name = name
        self.is variable = true
        self.gen var = nil
  
    generatedName (scope) =
      if (!self.gen var)
        self.gen var = scope.generateVariable (codegenUtils.concatName (self.name))

      self.gen var
  
    variable name (scope) =
      self.generated name (scope)
  
    generate java script (buffer, scope) =
      buffer.write (self.generated name (scope))
  
    generate java script parameter (args, ...) = self.generate java script (args, ...)
  
    generate java script target (args, ...) = self.generate java script (args, ...)
  
    definition name (scope) =
      n = codegen utils.concat name ([self.generated name (scope)])
      if (!scope.is defined (n))
          n
      else
          nil
}
