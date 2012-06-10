_ = require 'underscore'
codegen utils = require('./codegenUtils')

has scope (s) =
  if (!s)
    console.log '---------------- NO SCOPE! -----------------'
    throw (new (Error('no scope')))

module.exports (cg) =
    statements term = class extending (cg.term class) {
        constructor (statements, expression: false) =
            self.is statements = true
            self.statements = statements
            self.is expression statements = expression

        generate statements (statements, buffer, scope, global) =
          has scope (scope)

          names defined = _(self.statements).chain ().reduce @(list, statement)
            defs = statement.definitions(scope)
            list.concat(defs)
          [].uniq ().value ()

          if (names defined.length > 0)
            _(names defined).each @(name)
              scope.define (name)

            if (!global)
              buffer.write ('var ')

              codegen utils.write to buffer with delimiter (names defined, ',', buffer) @(item)
                buffer.write (item)

              buffer.write (';')

          _(statements).each @(statement)
            self.write sub statements for all sub terms (statement, buffer, scope)
            statement.generate java script statement (buffer, scope)
        
        write sub statements (subterm, buffer, scope) =
          if (subterm.is expression statements)
            statements = subterm
            if (statements.statements.length > 0)
              statements.generate statements (statements.statements.slice (0, statements.statements.length - 1), buffer, scope)
        
        write sub statements for all sub terms (statement, buffer, scope) =
          self.write sub statements (statement, buffer, scope)

          statement.walk descendants @(subterm)
            self.write sub statements (subterm, buffer, scope)
          not below @(subterm) if
            subterm.is statements && !subterm.is expression statements

        generate java script statements (buffer, scope, global) =
          self.generate statements (self.statements, buffer, scope, global)

        blockify (parameters, optionalParameters) =
          statements = if (self.is expression statements)
            self.cg.statements ([self])
          else
            self

          b = self.cg.block (parameters, statements)
          b.optional parameters = optional parameters
          b

        scopify () =
          self.cg.function call (self.cg.block([], self), [])

        generate java script statements return (buffer, scope, global) =
          if (self.statements.length > 0)
            self.generate statements (self.statements.slice (0, self.statements.length - 1), buffer, scope, global)
            return statement = self.statements.(self.statements.length - 1)
            self.write sub statements for all sub terms(return statement, buffer, scope)
            return statement.generate java script return (buffer, scope)

        generate java script (buffer, scope) =
          if (self.statements.length > 0)
            self.statements.(self.statements.length - 1).generate java script (buffer, scope)

        generate java script statement (buffer, scope) =
          if (self.statements.length > 0)
            self.statements.(self.statements.length - 1).generate java script statement (buffer, scope)

        generate java script return (buffer, scope) =
          if (self.statements.length > 0)
            self.statements.(self.statements.length - 1).generate java script return (buffer, scope)

        definitions (scope) =
          _(self.statements).reduce @(list, statement)
            defs = statement.definitions(scope)
            list.concat (defs)
          []
    }

    statements (args, ...) = new (statements term (args, ...))
