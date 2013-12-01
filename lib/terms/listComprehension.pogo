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

        generate (is async, result, indexes) =
            if (is async)
                generate =
                    terms.module constants.define ['generate'] as (
                        terms.javascript (async control.generate.to string ())
                    )

                index = terms.generated variable ['index']
                indexes.push (index)

                async statements = terms.async statements (self.next.generate (is async, result, indexes))

                [terms.function call (generate, [self.collection, terms.closure ([index, self.iterator], async statements)], async: true)]
            else
                [
                    terms.for each (
                        self.collection
                        self.iterator
                        terms.async statements (self.next.generate (is async, result, indexes))
                    )
                ]
    }

    sort each () = {
        is sort each

        generate list comprehension (is async) =
            if (is async)
                sort each =
                    terms.module constants.define ['sort', 'each'] as (
                        terms.javascript (async control.sort each.to string ())
                    )

                result = terms.generated variable ['result']

                async statements = terms.async statements (self.next.generate (is async, result, []))

                terms.function call (sort each, [terms.closure ([result], async statements)], async: true)
            else
                results variable = terms.generated variable ['results']

                statements = [terms.definition (results variable, terms.list [])]
                statements.push (self.next.generate (is async, results variable), ...)
                statements.push (results variable)

                terms.scope (statements)
    }

    map (expression) = {
        is map

        index string (indexes) =
            components = []

            for each @(index) in (indexes)
                if (components.length > 0)
                    components.push (terms.string '.')

                components.push (index)

            terms.interpolated string (components)

        generate (is async, result, indexes) =
            if (is async)
                [terms.function call (result, [self.index string (indexes), expression])]
            else
                [terms.method call (result, ['push'], [expression])]
    }

    definition (expression) = {
        is definition

        generate (is async, result, indexes) =
            statements = [expression]
            statements.push (self.next.generate (is async, result, indexes), ...)
            statements
    }

    filter (expression) = {
        is filter

        generate (is async, result, indexes) =
            [terms.if expression [{condition = expression, body = terms.async statements (self.next.generate (is async, result, indexes))}]]
    }

    is (expression) definition =
        expression.is definition

    list comprehension (items) =
        is async = _.any (items) @(item)
            item.contains async ()

        expr = comprehension expression from (items)

        expr.generate list comprehension (is async)
