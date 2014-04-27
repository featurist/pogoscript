module.exports (terms) = terms.term {
    constructor (items) =
        self.isRange = true
        self.items = items

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

    generateJavaScript (buffer, scope) =
        terms.functionCall (self.range, self.items).generateJavaScript (buffer, scope)
}
