_ = require 'underscore'
codegen utils = require('./codegenUtils')
statements utils = require './statementsUtils'

module.exports (terms) = terms.term {
    constructor (statements, async: false) =
        self.is statements = true
        self.statements = statements
        self.is async = async

    generate statements (statements, buffer, scope, in closure: false, global: false) =
        if (in closure)
            declared variables = self.find declared variables (scope)
            self.generate variable declarations (declared variables, buffer, scope, global: global)

        for (s = 0, s < statements.length, ++s)
            statement = statements.(s)
            statement.generate java script statement (buffer, scope)

    rewrite result term into (return term, async: false) =
        if (self.statements.length > 0)
            last statement = self.statements.(self.statements.length - 1)
            rewritten last statement = last statement.rewrite result term @(term) into (async: async)
                return term (term)

            if (rewritten last statement)
                self.statements.(self.statements.length - 1) = rewritten last statement
            else
                self.statements.push (return term (terms.nil ()))

    rewrite last statement to return (async: false) =
        contains continuation = self.contains continuation ()

        self.rewrite result term @(term) into (async: async)
            if (async @and @not contains continuation)
                terms.function call (terms.callback function, [terms.nil (), term])
            else
                terms.return statement (term, implicit: true)

    generate variable declarations (variables, buffer, scope, global: false) =
        if (variables.length > 0)
            _(variables).each @(name)
                scope.define (name)

            if (@not global)
                buffer.write ('var ')

                codegen utils.write to buffer with delimiter (variables, ',', buffer) @(variable)
                    buffer.write (variable)

                buffer.write (';')
        
    find declared variables (scope) =
        variables = codegen utils.declared variables (scope)

        self.walk descendants @(subterm, path)
            subterm.declare variables (variables, scope)
        not below @(subterm, path) if
            subterm.is closure

        variables.unique variables ()

    generate java script statements (buffer, scope, in closure: false, global: false) =
        self.generate statements (self.statements, buffer, scope, in closure: in closure, global: global)

    blockify (parameters, options) =
        statements = if (self.is expression statements)
            self.cg.statements ([self])
        else
            self

        terms.block (parameters, statements, options)

    scopify () =
        self.cg.function call (self.cg.block([], self), [])

    generate java script (buffer, scope) =
        if (self.statements.length > 0)
            self.statements.(self.statements.length - 1).generate java script (buffer, scope)

    generate java script statement (buffer, scope) =
        if (self.statements.length > 0)
            self.statements.(self.statements.length - 1).generate java script statement (buffer, scope)

    definitions (scope) =
        _(self.statements).reduce @(list, statement)
            defs = statement.definitions(scope)
            list.concat (defs)
        []

    serialise statements () =
        self.statements = statements utils.serialise statements (self.statements)
        nil

    asyncify () =
        if (!self.is async)
            self.rewrite last statement to return (async: true)
            self.is async = true
}
