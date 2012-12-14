module.exports (terms) =
    async callback (body, result variable: nil) =
        error variable = terms.generated variable ['error']
        catch error variable = terms.generated variable ['exception']

        body.rewrite result term @(term) into
            if (@not term.originally async)
                terms.function call (terms.callback function, [terms.nil (), term])
            else
                term
            
        terms.closure (
            [error variable, result variable]
            terms.statements [
                terms.if expression (
                    [
                        {
                            condition = error variable
                            body = terms.statements [
                                terms.function call (terms.callback function, [error variable])
                            ]
                        }
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
