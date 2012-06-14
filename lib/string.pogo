codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (value) =
        self.is string = true
        self.string = value

    generate java script (buffer, scope) =
      buffer.write (codegen utils.format java script string (this.string))
}
