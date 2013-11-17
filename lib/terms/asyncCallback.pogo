module.exports (terms) =
    async callback (body, result variable: nil) =
        error variable = terms.generated variable ['error']
        catch error variable = terms.generated variable ['exception']

        if (@not body.contains continuation ())
            body.rewrite result term @(term) into (async: true)
                if (@not term.originally async)
                    terms.return statement (terms.function call (terms.callback function, [terms.nil (), term]), implicit: true)
                else
                    term


        rethrow errors =
            terms.module constants.define ['rethrow', 'errors'] as (
                terms.javascript "function (continuation,block){return function(error,result){if(error){return continuation(error);}else{try{return block(result);}catch(ex){return continuation(ex);}}}}"
            )
            
        terms.function call (
            rethrow errors
            [
                terms.callback function
                terms.closure (
                    [result variable]
                    body
                    return last statement: false
                )
            ]
        )
