module.exports (terms) =
    async result () =
        result variable = terms.generated variable ['async', 'result']
        result variable.is async result = true
        result variable
