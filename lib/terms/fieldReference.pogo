codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (object, name) =
        self.object = object
        self.name = name
        self.is field reference = true

    generate (scope) =
        self.code (
            self.object.generate (scope)
            '.'
            codegen utils.concat name (self.name)
        )

    generate target (args, ...) = self.generate (args, ...)
}
