module.exports (terms) = terms.term {
    constructor (items) =
        self.isRange = true
        self.items = items
        self.inList = false

        self.range = terms.moduleConstants.define ['range'] as (
            terms.javascript (
                'function (a, b) {
                    var items = [];
                    for (var n = a; n <= b; n++) {
                        items.push(n);
                    }
                    return items;
                }'
            )
        )

    generate (scope) =
        if (self.inList)
            terms.functionCall (self.range, self.items).generate (scope)
        else
            terms.errors.addTerm (self) withMessage 'range operator can only be used in a list, as in [1..3]'.generate (scope)
}
