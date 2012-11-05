codegen utils = require './codegenUtils'

module.exports (terms) =
    create interpolated string = terms.term {
        constructor (components) =
            self.is interpolated string = true
            self.components = components

        generate java script (buffer, scope) =
            buffer.write '('
            codegen utils.write to buffer with delimiter (this.components, '+', buffer, scope)
            buffer.write ')'
    }

    interpolated string (components) =
        if (components.length == 1)
            components.0
        else if (components.length == 0)
            terms.string ('')
        else
            create interpolated string (components)
