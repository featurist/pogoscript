codegenUtils = require './codegenUtils'

module.exports (terms) =
  variableTerm = terms.term {
    constructor (name, location: nil, tag: nil) =
      self.variable = name
      self.isVariable = true
      self.setLocation (location)
      self.tag = tag

    declare (scope) =
      if (self.tag)
        scope.define (self.canonicalName ()) withTag (self.tag)
      else
        scope.define (self.canonicalName ())

    canonicalName () =
      codegenUtils.concatName (self.variable, escape: true)

    displayName () =
      self.variable.join ' '
  
    generate (scope) =
      if (self.tag)
        self.code (scope.findTag (self.tag))
      else
        self.code (self.canonicalName ())
  
    generateTarget (args, ...) = self.generate (args, ...)
  
    hashEntryField () =
      self.variable
  
    parameter () =
      self
  }

  variable (name, couldBeMacro: true, location: nil, tag: nil) =
    v = variableTerm (name, location: location, tag: tag)

    if (couldBeMacro)
      macro = terms.macros.findMacro (name)
  
      if (macro)
        return (macro (v, name))

    v
