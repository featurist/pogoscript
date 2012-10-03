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

    variable name (scope) =
        self.generated name (scope)

    generate java script (buffer, scope) =
        buffer.write (self.generated name (scope))

    generate java script parameter (args, ...) = self.generate java script (args, ...)

    generate java script target (args, ...) = self.generate java script (args, ...)

    declare variable (variables, scope, shadow: false) =
        name = codegen utils.concat name ([self.generated name (scope)])
        if (shadow || !scope.is defined (name))
            variables.push (name)
}
