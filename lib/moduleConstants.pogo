class = require './class'.class
codegenUtils = require './terms/codegenUtils'

module.exports (terms) =
    moduleConstants = terms.term {
      constructor () =
        self.namedDefinitions = {}
        self.listeners = []

      define (name) as (expression, generated: true) =
        canonicalName = codegenUtils.concatName (name)

        existingDefinition = self.namedDefinitions.(canonicalName)

        if (existingDefinition)
          existingDefinition.target
        else
          variable = if (generated)
            terms.generatedVariable (name)
          else
            terms.variable (name, couldBeMacro: false)

          self.namedDefinitions.(canonicalName) =
            definition = terms.definition (
              variable
              expression
            )

            self.notifyNewDefinition (definition)
            
            definition

          variable

      definitions () =
        defs = []
        for @(name) in (self.namedDefinitions)
          definition = self.namedDefinitions.(name)

          defs.push (definition)

        defs

      notifyNewDefinition (d) =
        for each @(listener) in (self.listeners)
          listener (d)

      onEachNewDefinition (block) =
        self.listeners.push (block)

      generate (scope) =
        self.generateIntoBuffer @(buffer)
          for each @(def) in (self.definitions ())
            buffer.write 'var '
            buffer.write (def.generate (scope))
            buffer.write ';'
    }
