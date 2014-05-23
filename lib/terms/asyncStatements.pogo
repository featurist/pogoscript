_ = require 'underscore'
codegenUtils = require('./codegenUtils')
statementsUtils = require './statementsUtils'

module.exports (terms) =
  createCallbackWithStatements (
    callbackStatements
    resultVariable: nil
    forceAsync: false
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
          terms.onFulfilledFunction
    else
      asyncStmts = putStatements (
        callbackStatements
      ) inCallbackForNextAsyncCall (
        forceAsync: forceAsync
        forceNotAsync: true
        definitions: []
      )
      terms.asyncCallback (asyncStmts, resultVariable: resultVariable)

  putStatements (statements) inCallbackForNextAsyncCall (forceAsync: false, forceNotAsync: false, definitions: nil) =
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
          containsContinuation: containsContinuation
        )

      if (asyncStatement)
        firstStatements = statements.slice (0, n)
        firstStatements.push (asyncStatement)

        return (terms.statements (firstStatements, async: @not forceNotAsync, definitions: []))

    terms.statements (statements, async: forceAsync, definitions: definitions)

  asyncStatements (statements, forceAsync: false) =
    definitions = [s <- statements, d <- s.definitions (), d]

    serialisedStatements = statementsUtils.serialiseStatements (statements)
    stmts = putStatements (serialisedStatements) inCallbackForNextAsyncCall (forceAsync: forceAsync, definitions: definitions)

    if (stmts.isAsync)
      stmts.promisify(definitions: definitions)
    else
      stmts
