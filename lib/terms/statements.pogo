_ = require 'underscore'
codegen utils = require('./codegenUtils')
statements utils = require './statementsUtils'

module.exports (terms) = terms.term {
    constructor (statements, async: false, globalDefinitions: globalDefinitions) =
        self.is statements = true
        self.statements = statements
        self.is async = async

        self.makeDefinitionsGlobal () =
            if (globalDefinitions)
                for each @(definition) in (globalDefinitions)
                    definition.global = true

    generate statements (scope, in closure: false, global: false) =
        self.generate into buffer @(buffer)
            if (in closure)
                defined variables = self.find defined variables (scope)
                self.generate variable declarations (defined variables, buffer, scope, global: global)

            for (s = 0, s < self.statements.length, ++s)
                statement = self.statements.(s)
                buffer.write (statement.generate statement (scope))

    rewrite result term into (return term, async: false) =
        if (self.statements.length > 0)
            last statement = self.statements.(self.statements.length - 1)
            rewritten last statement = last statement.rewrite result term @(term) into (async: async)
                return term (term)

            if (rewritten last statement)
                self.statements.(self.statements.length - 1) = rewritten last statement
            else
                self.statements.push (return term (terms.nil ()))
        else if (async)
            self.statements.push(terms.function call (terms.callback function, []))

    rewrite last statement to return (async: false, return call to continuation: true) =
        contains continuation = self.contains continuation ()

        self.rewrite result term @(term) into (async: async)
            if (async @and @not contains continuation)
                call to continuation = terms.function call (terms.callback function, [terms.nil (), term])

                if (return call to continuation)
                    terms.return statement (call to continuation, implicit: true)
                else
                    call to continuation
            else
                terms.return statement (term, implicit: true)

    generateVariableDeclarations (variables, buffer, scope, global: false) =
        if (variables.length > 0)
            _(variables).each @(name)
                scope.define (name)

            if (@not global)
                buffer.write ('var ')

                codegen utils.write to buffer with delimiter (variables, ',', buffer) @(variable)
                    buffer.write (variable)

                buffer.write (';')
        
    findDefinedVariables (scope) =
        variables = codegen utils.defined variables (scope)

        self.walk descendants @(subterm, path)
            subterm.define variables (variables, scope)
        not below @(subterm, path) if
            subterm.is closure

        variables.unique variables ()

    blockify (parameters, options) =
        statements = if (self.is expression statements)
            self.cg.statements ([self])
        else
            self

        terms.block (parameters, statements, options)

    scopify () =
        self.cg.function call (self.cg.block([], self), [])

    generate (scope) =
        self.generate into buffer @(buffer)
            if (self.statements.length > 0)
                buffer.write (self.statements.(self.statements.length - 1).generate (scope))

    generate statement (scope) =
        self.generate into buffer @(buffer)
            if (self.statements.length > 0)
                buffer.write (self.statements.(self.statements.length - 1).generate statement (scope))

    definitions (scope) =
        _(self.statements).reduce @(list, statement)
            defs = statement.definitions(scope)
            list.concat (defs)
        []

    serialise statements () =
        self.statements = statements utils.serialise statements (self.statements)
        nil

    asyncify (return call to continuation: true) =
        if (!self.is async)
            self.rewrite last statement to return (async: true, return call to continuation: return call to continuation)
            self.is async = true
}
