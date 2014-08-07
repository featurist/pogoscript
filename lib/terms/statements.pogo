_ = require 'underscore'
codegenUtils = require('./codegenUtils')
statementsUtils = require './statementsUtils'

module.exports (terms) = terms.term {
    constructor (statements, async: false, definitions: definitions, returnsPromise: false) =
        self.isStatements = true
        self.statements = statements
        self.isAsync = async
        self.returnsPromise = returnsPromise
        self._definitions = definitions

    generateStatements (scope, isScope: false, global: false) =
      self.generateIntoBuffer @(buffer)
        if (isScope)
          definedVariables = self.findDefinedVariables (scope)
          self.generateVariableDeclarations (definedVariables, buffer, global: global)

        for (s = 0, s < self.statements.length, ++s)
          statement = self.statements.(s)
          buffer.write (statement.generateStatement (scope))

    promisify (definitions: nil, statements: false) =
      if (@not self.returnsPromise)
        newPromise = terms.newPromise (statements: self)

        if (statements)
          terms.statements (
            [
              terms.newPromise (statements: self)
            ]
            returnsPromise: true
            definitions: definitions
          )
        else
          if (self.statements.length == 1)
            self.statements.0.promisify ()
          else
            terms.newPromise (statements: self)
      else
        if (statements)
          self
        else
          self.statements.0

    rewriteResultTermInto (returnTerm, async: false) =
      if (self.statements.length > 0)
        lastStatement = self.statements.(self.statements.length - 1)
        rewrittenLastStatement = lastStatement.rewriteResultTerm @(term) into (async: async)
          returnTerm (term)

        if (rewrittenLastStatement)
          self.statements.(self.statements.length - 1) = rewrittenLastStatement
        else
          self.statements.push (returnTerm (terms.nil ()))
      else if (async)
        self.statements.push(terms.functionCall (terms.onFulfilledFunction, []))

    rewriteLastStatementToReturn (async: false) =
      containsContinuation = self.containsContinuation ()

      self.rewriteResultTerm @(term) into ()
        if (async)
          terms.functionCall (terms.onFulfilledFunction, [term])
        else
          terms.returnStatement (term, implicit: true)

    generateVariableDeclarations (variables, buffer, global: false) =
      if (variables.length > 0)
        if (@not global)
          buffer.write ('var ')

          codegenUtils.writeToBufferWithDelimiter (variables, ',', buffer) @(variable)
            buffer.write (variable)

          buffer.write (';')

    findDefinedVariables (scope) =
      definitions = self._definitions @or self.definitions()
      variables = codegenUtils.definedVariables (scope)

      for each @(def) in (definitions)
        def.defineVariables (variables)

      variables.names ()

    blockify (parameters, options) =
      statements = if (self.isExpressionStatements)
        self.cg.statements ([self])
      else
        self

      terms.block (parameters, statements, options)

    scopify () =
      self.cg.functionCall (self.cg.block([], self), [])

    generate (scope) =
      self.generateIntoBuffer @(buffer)
        if (self.statements.length > 0)
          buffer.write (self.statements.(self.statements.length - 1).generate (scope))

    generateStatement (scope) =
      self.generateIntoBuffer @(buffer)
        if (self.statements.length > 0)
          buffer.write (self.statements.(self.statements.length - 1).generateStatement (scope))

    definitions (scope) = statementsUtils.definitions(self.statements)

    serialiseStatements () =
      self.statements = statementsUtils.serialiseStatements (self.statements)
      nil

    asyncify (returnCallToContinuation: true) =
      if (!self.isAsync)
        self.rewriteLastStatementToReturn (async: true, returnCallToContinuation: returnCallToContinuation)
        self.isAsync = true
}
