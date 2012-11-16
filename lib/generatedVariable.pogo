codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (name) =
        self.name = name
        self.is variable = true
        self.gen var = nil

    dont clone = true

    generated name (scope) =
        if (!self.gen var)
            self.gen var = scope.generate variable (codegen utils.concat name (self.name))

        self.gen var

    canonical name (scope) =
        self.generated name (scope)

    display name () =
        self.name

    generate java script (buffer, scope) =
        buffer.write (self.generated name (scope))

    generate java script parameter (args, ...) = self.generate java script (args, ...)

    generate java script target (args, ...) = self.generate java script (args, ...)
}
