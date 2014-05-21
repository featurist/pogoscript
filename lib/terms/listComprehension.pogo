_ = require 'underscore'
asyncControl = require '../asyncControl'

module.exports (terms) =
    macros = terms.macroDirectory ()

    comprehensionExpressionFor (expr) =
        if (expr.isGenerator)
            generator (expr)
        else if (is (expr) definition)
            definition (expr)
        else
            filter (expr)

    comprehensionExpressionFrom (items) =
        exprs = items.slice (0, items.length - 1)
        comprehensionExprs = [comprehensionExpressionFor (expr), where: expr <- exprs]

        comprehensionExprs.push (map (items.(items.length - 1)))
        comprehensionExprs.unshift (sortEach ())

        for (n = 0, n < comprehensionExprs.length - 1, ++n)
            comprehensionExprs.(n).next = comprehensionExprs.(n + 1)

        comprehensionExprs.(0)

    generator (expression) = {
        isGenerator
        iterator = expression.operatorArguments.0
        collection = expression.operatorArguments.1

        hasGenerator () = true

        generate (isAsync, result, index) =
            if (isAsync)
                listComprehension =
                    terms.moduleConstants.define ['list', 'comprehension'] as (
                        terms.javascript (asyncControl.listComprehension.toString ())
                    )

                innerResult = terms.generatedVariable ['result']
                innerIndex = terms.generatedVariable ['index']

                asyncStatements = terms.asyncStatements (self.next.generate (isAsync, innerResult, innerIndex))

                call =
                    terms.resolve (
                      terms.functionCall (
                          listComprehension
                          [
                              self.collection
                              terms.boolean (self.next.hasGenerator ())
                              terms.closure (
                                  [
                                      innerIndex
                                      self.iterator
                                      innerResult
                                  ]
                                  asyncStatements
                              )
                          ]
                      )
                    )

                if (result)
                    [terms.functionCall (result, [call, index])]
                else
                    [call]
            else
                scope = terms.scope (self.next.generate (isAsync, result, index), alwaysGenerateFunction: true, variables: [self.iterator])
                [
                    terms.forEach (
                        self.collection
                        self.iterator
                        terms.asyncStatements [scope]
                    )
                ]
    }

    sortEach () = {
        isSortEach

        generateListComprehension (isAsync) =
            if (isAsync)
                self.next.generate (isAsync).0
            else
                resultsVariable = terms.generatedVariable ['results']

                statements = [terms.definition (resultsVariable, terms.list [])]
                statements.push (self.next.generate (isAsync, resultsVariable), ...)
                statements.push (resultsVariable)

                terms.scope (statements)
    }

    map (expression) = {
        isMap

        hasGenerator () = false

        generate (isAsync, result, index) =
            if (isAsync)
                [terms.functionCall (result, [expression, index])]
            else
                [terms.methodCall (result, ['push'], [expression])]
    }

    definition (expression) = {
        isDefinition

        hasGenerator () = self.next.hasGenerator ()

        generate (isAsync, result, index) =
            statements = [expression]
            statements.push (self.next.generate (isAsync, result, index), ...)
            statements
    }

    filter (expression) = {
        isFilter

        hasGenerator () = self.next.hasGenerator ()

        generate (isAsync, result, index) =
            [terms.ifExpression [{condition = expression, body = terms.asyncStatements (self.next.generate (isAsync, result, index))}]]
    }

    is (expression) definition =
        expression.isDefinition

    listComprehension (items) =
        isAsync = _.any (items) @(item)
            item.containsAsync ()

        expr = comprehensionExpressionFrom (items)

        expr.generateListComprehension (isAsync)
