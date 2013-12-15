codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (value) =
        self.is string = true
        self.string = value

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write (codegen utils.format java script string (self.string))
}
