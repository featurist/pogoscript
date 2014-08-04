codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
  constructor (entries) =
    self.is hash = true
    self.entries = entries

  generate (scope) =
    self.generate into buffer @(buffer)
      buffer.write ('{')

      codegen utils.write to buffer with delimiter (self.entries, ',', buffer) @(item)
        buffer.write (item.generate hash entry (scope))

      buffer.write ('}')

  generateStatement (scope) =
    terms.definition(terms.generatedVariable ['o'], self).generateStatement (scope)
}
