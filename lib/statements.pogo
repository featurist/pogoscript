_ = require 'underscore'
codegen utils = require('./codegenUtils')

module.exports (terms) = terms.term {
    constructor (statements, global: false) =
        self.is statements = true
        self.statements = statements
        self.global = global

    generate statements (statements, buffer, scope) =
        declared variables = self.find declared variables (scope)
        self.generate variable declarations (declared variables, buffer, scope)

        for (s = 0, s < statements.length, s = s + 1)
            statement = statements.(s)
            statement.generate java script statement (buffer, scope)

    rewrite async callbacks (
        return last statement: false
        force async: false
    ) =
        statements = self._serialise statements (self.statements)

        made statements return = false

        statements with return (async: false) =
            if (!made statements return)
                return term (term) =
                    if (return last statement)
                        if (async)
                            terms.function call (terms.callback function, [terms.nil (), term])
                        else
                            terms.return statement (term, implicit: true)
                    else
                        term

                if (statements.length > 0)
                    statements.(statements.length - 1) =
                        statements.(statements.length - 1).rewrite result term @(term) into
                            return term (term)

                made statements return = true

            statements

        for (n = 0, n < statements.length, n = n + 1)
            statement = statements.(n)
            async statement = statement.make async with statements @(error variable)
                self._wrap callback statements (
                    statements with return (async: true).slice (n + 1)
                    error variable: error variable
                )

            if (async statement)
                first statements = statements.slice (0, n)
                first statements.push (async statement)

                return {
                    statements = (terms.statements (first statements))
                    is async = true
                }

        {
            statements = terms.statements (statements with return (async: force async), global: self.global)
            is async = force async
        }

    _wrap callback statements (callback statements, error variable: nil) =
        catch error variable = terms.generated variable ['error']
        [
            terms.if expression (
                [
                    [
                        error variable
                        terms.statements [
                            terms.function call (terms.callback function, [error variable])
                        ]
                    ]
                ]
                terms.statements [
                    terms.try expression (
                        terms.statements (callback statements)
                        catch parameter: catch error variable
                        catch body: terms.statements [
                            terms.function call (terms.callback function, [catch error variable])
                        ]
                    )
                ]
            )
        ]

    _serialise statements (statements) =
        serialised statements = []

        for (n = 0, n < statements.length, n = n + 1)
            statement = statements.(n)
            rewritten statement = 
                statement.clone (
                    rewrite (term, clone: nil, path: nil):
                        term.serialise sub statements (serialised statements, clone, path.length == 1)
                        
                    limit (term):
                        term.is closure
                )

            serialised statements.push (rewritten statement)

        serialised statements

    return last statement (return term) =
        if (self.statements.length > 0)
            self.statements.(self.statements.length - 1) =
                self.statements.(self.statements.length - 1).rewrite result term @(term) into
                    return term (term)

    serialise sub statements (serialised statements, clone) =
        terms.statements (self._serialise statements (self.statements))

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

    blockify (parameters, optionalParameters, async: false) =
        statements = if (self.is expression statements)
            self.cg.statements ([self])
        else
            self

        b = self.cg.block (parameters, statements, async: async)
        b.optional parameters = optional parameters
        b

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
}
