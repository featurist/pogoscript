codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (value) =
        self.is string = true
        self.string = value

    generate (scope) =
        self.code (codegen utils.format java script string (self.string))
}
