class = require './class'.class
codegen utils = require './terms/codegenUtils'

module.exports (terms) =
    module constants = class {
        constructor () =
            self.named definitions = {}
            self.listeners = []

        define (name) as (expression) =
            canonical name = codegen utils.concat name (name)

            existing definition = self.named definitions.(canonical name)

            if (existing definition)
                existing definition.target
            else
                variable = terms.generated variable (name)

                self.named definitions.(canonical name) =
                    definition = terms.definition (
                        variable
                        expression
                    )

                    self.notify new definition (definition)
                    
                    definition

                variable

        definitions () =
            defs = []
            for @(name) in (self.named definitions)
                definition = self.named definitions.(name)

                defs.push (definition)

            defs

        notify new definition (d) =
            for each @(listener) in (self.listeners)
                listener (d)

        on each new definition (block) =
            self.listeners.push (block)

        generate java script (buffer, scope) =
            for each @(def) in (self.definitions ())
                buffer.write 'var '
                def.generate java script (buffer, scope)
                buffer.write ';'
    }
