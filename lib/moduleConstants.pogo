class = require './class'.class
codegen utils = require './terms/codegenUtils'

module.exports (terms) =
    module constants = terms.term {
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

        generate (scope) =
            self.generate into buffer @(buffer)
                for each @(def) in (self.definitions ())
                    buffer.write 'var '
                    buffer.write (def.generate (scope))
                    buffer.write ';'
    }
