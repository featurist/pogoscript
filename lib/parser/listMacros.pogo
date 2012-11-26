_ = require 'underscore'

module.exports (terms) =
    macros = terms.macro directory ()

    is (term) valid comprehension =
        if (term.items.length < 2)
            @return false

        first item is not hash entry () = @not term.items.0.is hash entry
        second item is where hash entry () = term.items.1.is hash entry @and term.items.1.field.length == 1 @and term.items.1.field.0 == 'where'
        second item is iterator () = is (term.items.1.value) iterator
        the rest of the items are not hash entries () = @not _.any (term.items.slice 2) @(item) @{item.is hash entry}

        first item is not hash entry () @and second item is where hash entry () @and second item is iterator () @and the rest of the items are not hash entries ()

    comprehension expression for (expr) =
        if (is (expr) iterator)
            iterator (expr)
        else if (is (expr) definition)
            definition (expr)
        else
            filter (expr)

    comprehension expressions from (term, results variable) =
        exprs = term.items.slice (2)
        exprs.unshift (term.items.1.value)
        comprehension exprs = [comprehension expression for (expr), where: expr <- exprs]

        comprehension exprs.push (map (term.items.0, results variable))
        expressions (comprehension exprs)

    iterator (expression) = {
        is iterator
        iterator = expression.function arguments.0
        collection = expression.function arguments.1

        generate (rest) =
            [terms.for each (self.collection, self.iterator, terms.async statements (rest.generate ()))]
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

    is (expression) iterator =
        if (expression.is function call)
            function = expression.function
            if (function.is variable)
                if (function.variable.length == 1 @and function.variable.0 == '<-')
                    true

    is (expression) definition =
        expression.is definition

    macros.add macro ['where'] @(term, name, args)
        bad comprehension () =
            terms.errors.add term (term) with message "not a list comprehension, try:\n\n    [y + 1, where: x <- [1..10], x % 2, y = x + 10]"

        if (is (term) valid comprehension)
            results variable = terms.generated variable ['results']
            exprs = comprehension expressions from (term, results variable)

            statements = [terms.definition (results variable, terms.list [])]
            statements.push (exprs.generate (), ...)
            statements.push (results variable)
            terms.scope (statements)
        else
            bad comprehension ()

    macros
