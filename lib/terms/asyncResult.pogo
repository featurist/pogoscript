module.exports (terms) =
    asyncResult () =
        resultVariable = terms.generatedVariable ['async', 'result']
        resultVariable.isAsyncResult = true
        resultVariable
