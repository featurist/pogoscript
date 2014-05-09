_ = require 'underscore'
codegenUtils = require('./codegenUtils')
statementsUtils = require './statementsUtils'

module.exports (terms) =
    createCallbackWithStatements (
        callbackStatements
        resultVariable: nil
        forceAsync: false
        global: false
        containsContinuation: containsContinuation
    ) =
        if ((callbackStatements.length == 1) && (callbackStatements.0.isAsyncResult))
            if (containsContinuation)
                errorVariable = terms.generatedVariable ['error']
                terms.closure (
                    [errorVariable]
                    terms.statements [
                        terms.ifExpression (
                            [{
                                condition = errorVariable
                                body = terms.statements [
                                    terms.functionCall (terms.continuationFunction, [errorVariable])
                                ]
                            }]
                        )
                    ]
                )
            else
                terms.continuationFunction
        else
            asyncStmts = putStatements (
                callbackStatements
            ) inCallbackForNextAsyncCall (
                forceAsync: forceAsync
                forceNotAsync: true
                global: global
            )
            terms.asyncCallback (asyncStmts, resultVariable: resultVariable)

    putStatements (statements) inCallbackForNextAsyncCall (forceAsync: false, forceNotAsync: false, global: false, globalDefinitions: nil) =
        containsContinuation =
            if (statements.length > 0)
                [stmt.containsContinuation (), where: stmt <- statements].reduce @(l, r) @{l @or r}
            else
                false

        for (n = 0, n < statements.length, ++n)
            statement = statements.(n)
            asyncStatement = statement.makeAsyncWithCallbackForResult @(resultVariable)
                createCallbackWithStatements (
                    statements.slice (n + 1)
                    resultVariable: resultVariable
                    forceAsync: forceAsync
                    global: global
                    containsContinuation: containsContinuation
                )

            if (asyncStatement)
                firstStatements = statements.slice (0, n)
                firstStatements.push (asyncStatement)

                return (terms.statements (firstStatements, async: @not forceNotAsync, globalDefinitions: globalDefinitions))

        terms.statements (statements, async: forceAsync)

    asyncStatements (statements, forceAsync: false, global: false) =
        globalDefinitions = [s <- statements, s.isDefinition, s]

        serialisedStatements = statementsUtils.serialiseStatements (statements)
        putStatements (serialisedStatements) inCallbackForNextAsyncCall (forceAsync: forceAsync, global: global, globalDefinitions: globalDefinitions)
