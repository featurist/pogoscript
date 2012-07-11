module.exports (terms) =
    post increment = terms.term {
        constructor (expr) =
            self.expression = expr

        generate java script (buffer, scope) =
            self.expression.generate java script(buffer, scope)
            buffer.write('++')
    }

    for each (collection, item variable, stmts) =
        items var = terms.generated variable ['items']
        index var = terms.generated variable ['i']

        s = [terms.definition(item variable, terms.indexer(items var, indexVar))]
        s.push (stmts.statements, ...)

        statements with item assignment = terms.statements(s)

        init = terms.definition(indexVar, terms.integer(0))
        test = terms.operator('<', [index var, terms.field reference(items var, ['length'])])
        incr = post increment(index var)

        terms.sub statements [
            terms.definition(items var, collection)
            terms.for statement(init, test, incr, statements with item assignment)
        ]
