module.exports (terms) =
    async callback (body, result variable: nil) =
        error variable = terms.generated variable ['error']
        catch error variable = terms.generated variable ['exception']

        if (@not body.contains continuation ())
            body.rewrite result term @(term) into (async: true)
                if (@not term.originally async)
                    terms.return statement (terms.function call (terms.continuation function, [term]), implicit: true)
                else
                    term


        terms.closure (
            [result variable]
            body
            return last statement: false
        )
