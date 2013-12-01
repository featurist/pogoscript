_ = require 'underscore'
async control = require '../asyncControl'

module.exports (terms) =
    macros = terms.macro directory ()

    comprehension expression for (expr) =
        if (expr.is generator)
            generator (expr)
        else if (is (expr) definition)
            definition (expr)
        else
            filter (expr)

    comprehension expression from (items) =
        exprs = items.slice (0, items.length - 1)
        comprehension exprs = [comprehension expression for (expr), where: expr <- exprs]

        comprehension exprs.push (map (items.(items.length - 1)))
        comprehension exprs.unshift (sort each ())

        for (n = 0, n < comprehension exprs.length - 1, ++n)
            comprehension exprs.(n).next = comprehension exprs.(n + 1)

        comprehension exprs.(0)

    generator (expression) = {
        is generator
        iterator = expression.operator arguments.0
        collection = expression.operator arguments.1

        has generator () = true

        generate (is async, result, index) =
            if (is async)
                list comprehension =
                    terms.module constants.define ['list', 'comprehension'] as (
                        terms.javascript (async control.list comprehension.to string ())
                    )

                inner result = terms.generated variable ['result']
                inner index = terms.generated variable ['index']

                async statements = terms.async statements (self.next.generate (is async, inner result, inner index))

                call =
                    terms.function call (
                        list comprehension
                        [
                            self.collection
                            terms.boolean (self.next.has generator ())
                            terms.closure (
                                [
                                    inner index
                                    self.iterator
                                    inner result
                                ]
                                async statements
                            )
                        ]
                        async: true
                    )

                if (result)
                    [terms.function call (result, [call, index])]
                else
                    [call]
            else
                [
                    terms.for each (
                        self.collection
                        self.iterator
                        terms.async statements (self.next.generate (is async, result, index))
                    )
                ]
    }

    sort each () = {
        is sort each

        generate list comprehension (is async) =
            if (is async)
                self.next.generate (is async).0
            else
                results variable = terms.generated variable ['results']

                statements = [terms.definition (results variable, terms.list [])]
                statements.push (self.next.generate (is async, results variable), ...)
                statements.push (results variable)

                terms.scope (statements)
    }

    map (expression) = {
        is map

        has generator () = false

        generate (is async, result, index) =
            if (is async)
                [terms.function call (result, [expression, index])]
            else
                [terms.method call (result, ['push'], [expression])]
    }

    definition (expression) = {
        is definition

        has generator () = self.next.has generator ()

        generate (is async, result, index) =
            statements = [expression]
            statements.push (self.next.generate (is async, result, index), ...)
            statements
    }

    filter (expression) = {
        is filter

        has generator () = self.next.has generator ()

        generate (is async, result, index) =
            [terms.if expression [{condition = expression, body = terms.async statements (self.next.generate (is async, result, index))}]]
    }

    is (expression) definition =
        expression.is definition

    list comprehension (items) =
        is async = _.any (items) @(item)
            item.contains async ()

        expr = comprehension expression from (items)

        expr.generate list comprehension (is async)
