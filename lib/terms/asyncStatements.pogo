_ = require 'underscore'
codegen utils = require('./codegenUtils')
statements utils = require './statementsUtils'

module.exports (terms) =
    create callback with statements (
        callback statements
        result variable: nil
        force async: false
        global: false
        contains continuation: contains continuation
    ) =
        if ((callback statements.length == 1) && (callback statements.0.is async result))
            if (contains continuation)
                error variable = terms.generated variable ['error']
                terms.closure (
                    [error variable]
                    terms.statements [
                        terms.if expression (
                            [{
                                condition = error variable
                                body = terms.statements [
                                    terms.function call (terms.callback function, [error variable])
                                ]
                            }]
                        )
                    ]
                )
            else
                terms.callback function
        else
            async stmts = put statements (
                callback statements
            ) in callback for next async call (
                force async: force async
                force not async: true
                global: global
            )
            terms.async callback (async stmts, result variable: result variable)

    put statements in callback for next async call (statements, force async: false, force not async: false, global: false) =
        contains continuation =
            if (statements.length > 0)
                [stmt.contains continuation (), where: stmt <- statements].reduce @(l, r) @{l @or r}
            else
                false

        for (n = 0, n < statements.length, ++n)
            statement = statements.(n)
            async statement = statement.make async with callback for result @(result variable)
                create callback with statements (
                    statements.slice (n + 1)
                    result variable: result variable
                    force async: force async
                    global: global
                    contains continuation: contains continuation
                )

            if (async statement)
                first statements = statements.slice (0, n)
                first statements.push (async statement)

                return (terms.statements (first statements, async: true && !force not async))

        terms.statements (statements, global: global, async: force async)

    async statements (statements, force async: false, global: false) =
        serialised statements = statements utils.serialise statements (statements)
        put statements (serialised statements) in callback for next async call (force async: force async, global: global)
