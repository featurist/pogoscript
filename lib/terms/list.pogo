codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (items) =
        self.is list = true
        self.items = items

    generate java script (buffer, scope) =
        buffer.write ('[')
        codegen utils.write to buffer with delimiter (self.items, ',', buffer, scope)
        buffer.write (']')
}
