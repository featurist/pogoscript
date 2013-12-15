codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (entries) =
        self.is hash = true
        self.entries = entries
  
    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write ('{')

            codegen utils.write to buffer with delimiter (self.entries, ',', buffer) @(item)
                buffer.write (item.generate hash entry (scope))

            buffer.write ('}')
}
