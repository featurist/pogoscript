_ = require 'underscore'
codegen utils = require('./codegenUtils')
statements utils = require './statementsUtils'

module.exports (terms) =
    create callback with statements (callback statements, result variable: nil) =
        if ((callback statements.length == 1) && (callback statements.0.is async result))
            terms.callback function
        else
            terms.async callback (terms.statements (callback statements), result variable: result variable)

    async statements (statements, return last statement: true, force async: false, global: false) =
        statements = statements utils.serialise statements (statements)

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
