_ = require 'underscore'
codegen utils = require('./codegenUtils')

has scope (s) =
  if (!s)
    console.log '---------------- NO SCOPE! -----------------'
    throw (new (Error('no scope')))

exports.statements (statements, expression: false) =
  self.term =>
    self.is statements = true
    self.statements = statements
    self.is expression statements = expression
    
    self.generate statements (statements, buffer, scope, global) =
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
    
    self.write sub statements (subterm, buffer, scope) =
      if (subterm.is expression statements)
        statements = subterm
        if (statements.statements.length > 0)
          statements.generate statements (statements.statements.slice (0, statements.statements.length - 1), buffer, scope)
    
    self.write sub statements for all sub terms (statement, buffer, scope) =
      self.write sub statements (statement, buffer, scope)
      statement.walk descendants @(subterm)
        self.write sub statements (subterm, buffer, scope)
      not below @(subterm) if
        subterm.is statements && !subterm.is expression statements

    self.generate java script statements (buffer, scope, global) =
      self.generate statements (self.statements, buffer, scope, global)

    self.blockify (parameters, optionalParameters) =
      b = self.cg.block (parameters, self)
      b.optional parameters = optional parameters
      b

    self.scopify () =
      self.cg.function call (self.cg.block([], self), [])

    self.generate java script statements return (buffer, scope, global) =
      if (self.statements.length > 0)
        self.generate statements (self.statements.slice (0, self.statements.length - 1), buffer, scope, global)
        return statement = self.statements.(self.statements.length - 1)
        self.write sub statements for all sub terms(return statement, buffer, scope)
        return statement.generate java script return (buffer, scope)

    self.generate java script (buffer, scope) =
      if (self.statements.length > 0)
        self.statements.(self.statements.length - 1).generate java script (buffer, scope)

    self.generate java script statement (buffer, scope) =
      if (self.statements.length > 0)
        self.statements.(self.statements.length - 1).generate java script statement (buffer, scope)

    self.generate java script return (buffer, scope) =
      if (self.statements.length > 0)
        self.statements.(self.statements.length - 1).generate java script return (buffer, scope)

    self.definitions (scope) =
      _(statements).reduce @(list, statement)
        defs = statement.definitions(scope)
        list.concat (defs)
      []
