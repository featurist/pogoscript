_ = require 'underscore'
codegen utils = require('./codegenUtils')

module.exports (terms) =
    create callback with statements (callback statements, result variable: nil) =
        error variable = terms.generated variable ['error']
        catch error variable = terms.generated variable ['exception']

        body = terms.statements (callback statements)
        body.rewrite result term @(term) into
            terms.function call (terms.callback function, [terms.nil (), term])
            
        terms.closure (
            [error variable, result variable]
            terms.statements [
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
                            body
                            catch parameter: catch error variable
                            catch body: terms.statements [
                                terms.function call (terms.callback function, [catch error variable])
                            ]
                        )
                    ]
                )
            ]
            return last statement: false
        )

    serialise statements (statements) =
        serialised statements = []

        for (n = 0, n < statements.length, n = n + 1)
            statement = statements.(n)
            rewritten statement = 
                statement.clone (
                    rewrite (term, clone: nil, path: nil):
                        term.serialise sub statements (serialised statements, clone, path.length == 1)
                        
                    limit (term):
                        term.is statements
                )

            serialised statements.push (rewritten statement)

        serialised statements

    async statements (statements, return last statement: true, force async: false, global: false) =
        statements = serialise statements (statements)

        made statements return = false

        for (n = 0, n < statements.length, n = n + 1)
            statement = statements.(n)
            async statement = statement.make async with callback for result @(result variable)
                create callback with statements (
                    statements.slice (n + 1)
                    result variable: result variable
                )

            if (async statement)
                first statements = statements.slice (0, n)
                first statements.push (async statement)

                return (terms.statements (first statements, async: true))

        terms.statements (statements, global: global, async: force async)
