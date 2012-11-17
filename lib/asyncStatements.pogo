_ = require 'underscore'
codegen utils = require('./codegenUtils')
statements utils = require './statementsUtils'

module.exports (terms) =
    create callback with statements (callback statements, result variable: nil, force async: false, global: false) =
        if ((callback statements.length == 1) && (callback statements.0.is async result))
            terms.callback function
        else
            async stmts = put statements (callback statements) in callback for next async call (force async: force async, force not async: true, global: global)
            terms.async callback (async stmts, result variable: result variable)

    put statements in callback for next async call (statements, force async: false, force not async: false, global: false) =
        for (n = 0, n < statements.length, ++n)
            statement = statements.(n)
            async statement = statement.make async with callback for result @(result variable)
                create callback with statements (
                    statements.slice (n + 1)
                    result variable: result variable
                    force async: force async
                    global: global
                )

            if (async statement)
                first statements = statements.slice (0, n)
                first statements.push (async statement)

                return (terms.statements (first statements, async: true && !force not async))

        terms.statements (statements, global: global, async: force async)

    async statements (statements, force async: false, global: false) =
        serialised statements = statements utils.serialise statements (statements)

        put statements (serialised statements) in callback for next async call (force async: force async, global: global)
