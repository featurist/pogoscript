_ = require 'underscore'
codegen utils = require('./codegenUtils')
statements utils = require './statementsUtils'

module.exports (terms) = terms.term {
    constructor (statements, global: false, async: false) =
        self.is statements = true
        self.statements = statements
        self.global = global
        self.is async = async

    generate statements (statements, buffer, scope) =
        declared variables = self.find declared variables (scope)
        self.generate variable declarations (declared variables, buffer, scope)

        for (s = 0, s < statements.length, s = s + 1)
            statement = statements.(s)
            statement.generate java script statement (buffer, scope)

    rewrite result term into (return term) =
        if (self.statements.length > 0)
            last statement = self.statements.(self.statements.length - 1)
            rewritten last statement = last statement.rewrite result term @(term) into
                return term (term)

            if (rewritten last statement)
                self.statements.(self.statements.length - 1) = rewritten last statement
            else
                self.statements.push (return term (terms.nil ()))

    rewrite last statement to return (async: false) =
        self.rewrite result term @(term) into
            if (async)
                terms.function call (terms.callback function, [terms.nil (), term])
            else
                terms.return statement (term, implicit: true)

    generate variable declarations (variables, buffer, scope) =
        if (variables.length > 0)
            _(variables).each @(name)
                scope.define (name)

            if (!self.global)
                buffer.write ('var ')

                codegen utils.write to buffer with delimiter (variables, ',', buffer) @(variable)
                    buffer.write (variable)

                buffer.write (';')
        
    find declared variables (scope) =
        declared variables = []

        self.walk descendants @(subterm)
            subterm.declare variables (declared variables, scope)
        not below @(subterm, path) if
            subterm.is statements && path.(path.length - 1).is closure

        _.uniq (declared variables)

    generate java script statements (buffer, scope) =
        self.generate statements (self.statements, buffer, scope)

    blockify (parameters, optional parameters: nil, async: false) =
        statements = if (self.is expression statements)
            self.cg.statements ([self])
        else
            self

        terms.block (parameters, statements, optional parameters: optional parameters, async: async)

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
