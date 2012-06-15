codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (entries) =
        self.is hash = true
        self.entries = entries
  
    generate java script (buffer, scope) =
      buffer.write ('{')

      codegen utils.write to buffer with delimiter (self.entries, ',', buffer) @(item)
        item.generate java script hash entry (buffer, scope)

      buffer.write ('}')
}
