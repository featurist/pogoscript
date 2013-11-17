codegen utils = require './terms/codegenUtils'

module.exports (terms) =
    module constants = class {
        constructor () =
            self.named definitions = {}

        define (name) as (expression) =
            canonical name = codegen utils.concat name (name)

            existing definition = self.named definitions.(canonical name)

            if (existing definition)
                existing definition.target
            else
                variable = terms.generated variable (name)

                self.named definitions.(canonical name) =
                    terms.definition (
                        variable
                        expression
                    )

                variable

        definitions () =
            defs = []
            for @(name) in (self.named definitions)
                definition = self.named definitions.(name)

                defs.push (definition)

            defs

        generate java script (buffer, scope) =
            for each @(def) in (self.definitions ())
                buffer.write 'var '
                def.generate java script (buffer, scope)
                buffer.write ';'
    }
