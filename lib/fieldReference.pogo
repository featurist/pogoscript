codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (object, name) =
        self.object = object
        self.name = name
        self.is field reference = true

    generate java script (buffer, scope) =
        self.object.generate java script (buffer, scope)
        buffer.write ('.')
        buffer.write (codegen utils.concat name (self.name))

    generate java script target (args, ...) = self.generate java script (args, ...)
}
