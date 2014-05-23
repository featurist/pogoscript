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

    generateStatements (scope, inClosure: false, global: false) =
        self.generateIntoBuffer @(buffer)
            subScope =
              if (inClosure)
                definitionScope = scope.subScope()
                definedVariables = self.findDefinedVariables (definitionScope)
                self.generateVariableDeclarations (definedVariables, buffer, global: global)
                definitionScope
              else
                scope

            for (s = 0, s < self.statements.length, ++s)
                statement = self.statements.(s)
                buffer.write (statement.generateStatement (subScope))

    promisify (definitions: nil) =
      if (@not self.returnsPromise)
        terms.statements (
          [
            terms.newPromise (statements: self)
          ]
          returnsPromise: true
          definitions: definitions
        )
      else
        self

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

    rewriteLastStatementToReturn (async: false, returnCallToContinuation: true) =
        containsContinuation = self.containsContinuation ()

        self.rewriteResultTerm @(term) into (async: async)
            if (async @and @not containsContinuation)
                callToContinuation = terms.functionCall (terms.onFulfilledFunction, [term])

                if (returnCallToContinuation)
                    terms.returnStatement (callToContinuation, implicit: true)
                else
                    callToContinuation
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

        for each @(def) in (definitions)
            def.defineVariables (scope)

        scope.names ()

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

    definitions (scope) =
        _(self.statements).reduce @(list, statement)
            defs = statement.definitions(scope)
            list.concat (defs)
        []

    serialiseStatements () =
        self.statements = statementsUtils.serialiseStatements (self.statements)
        nil

    asyncify (returnCallToContinuation: true) =
        if (!self.isAsync)
            self.rewriteLastStatementToReturn (async: true, returnCallToContinuation: returnCallToContinuation)
            self.isAsync = true
}
