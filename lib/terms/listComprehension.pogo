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

    comprehension expressions from (items, results variable) =
        exprs = items.slice (0, items.length - 1)
        comprehension exprs = [comprehension expression for (expr), where: expr <- exprs]

        comprehension exprs.push (map (items.(items.length - 1), results variable))
        expressions (comprehension exprs)

    generator (expression) = {
        is generator
        iterator = expression.operator arguments.0
        collection = expression.operator arguments.1

        generate (rest) =
            statements = terms.async statements (rest.generate ())

            if (statements.is async)
                generate =
                    terms.module constants.define ['generate'] as (
                        terms.javascript (async control.generate.to string ())
                    )
                
                [terms.function call (generate, [self.collection, terms.closure ([self.iterator], statements)], async: true)]
            else
                [terms.for each (self.collection, self.iterator, statements)]
    }

    map (expression, results variable) = {
        is map
        generate () =
            [terms.method call (results variable, ['push'], [expression])]
    }

    definition (expression) = {
        is definition
        generate (rest) =
            statements = [expression]
            statements.push (rest.generate(), ...)
            statements
    }

    filter (expression) = {
        is filter
        generate (rest) =
            [terms.if expression [{condition = expression, body = terms.async statements (rest.generate ())}]]
    }

    expressions (exprs) = {
        expressions = exprs
        generate () =
            if (exprs.length > 0)
                exprs.0.generate (expressions (exprs.slice (1)))
            else
                []
    }

    is (expression) definition =
        expression.is definition

    list comprehension (items) =
        results variable = terms.generated variable ['results']
        exprs = comprehension expressions from (items, results variable)

        statements = [terms.definition (results variable, terms.list [])]
        statements.push (exprs.generate (), ...)
        statements.push (results variable)
        terms.scope (statements)
