module.exports (terms) =
    asyncCallback (body, resultVariable: nil) =
        errorVariable = terms.generatedVariable ['error']
        catchErrorVariable = terms.generatedVariable ['exception']

        if (@not body.containsContinuation ())
            body.rewriteResultTerm @(term) into (async: true)
                if (@not term.originallyAsync)
                    terms.returnStatement (terms.functionCall (terms.continuationFunction, [term]), implicit: true)
                else
                    term


        terms.closure (
            [resultVariable]
            body
            returnLastStatement: false
        )
