terms = require '../../lib/parser/codeGenerator'.code generator ()
require '../assertions'

describe 'try expression term'
    describe 'returning as last statement'
        it 'returns last statement from body and catch body'
            try expression =
                terms.try expression (
                    terms.statements [
                        terms.variable ['a']
                        terms.variable ['b']
                    ]
                    catch body: terms.statements [
                        terms.variable ['c']
                        terms.variable ['d']
                    ]
                    catch parameter: terms.variable ['e']
                )

            expected try expression = 
                terms.try expression (
                    terms.statements [
                        terms.variable ['a']
                        terms.return statement (terms.variable ['b'], implicit: true)
                    ]
                    catch body: terms.statements [
                        terms.variable ['c']
                        terms.return statement (terms.variable ['d'], implicit: true)
                    ]
                    catch parameter: terms.variable ['e']
                )

            try expression.rewrite result term @(term) into @{terms.return statement (term, implicit: true)}

            (try expression) should contain fields (expected try expression)

    describe 'when any of the bodies are asynchronous'
        it 'generates a call to an asynchronous try function'
            try expression = terms.try expression (
                terms.statements (
                    [
                        terms.variable ['a']
                    ]
                    async: true
                )
                catch body: terms.statements [
                    terms.variable ['error']
                ]
                catch parameter: terms.variable ['error']
                finally body: terms.statements [
                    terms.variable ['error']
                ]
            )

            body = terms.closure (
                []
                terms.statements (
                    [
                        terms.variable ['a']
                    ]
                    async: true
                )
            )

            catch body = terms.closure (
                [terms.variable ['error']]
                terms.statements [
                    terms.variable ['error']
                ]
            )
            catch body.asyncify ()

            finally body = terms.closure (
                []
                terms.statements [
                    terms.variable ['error']
                ]
            )
            finally body.asyncify ()

            expected try expression = terms.function call (
                terms.generated variable ['async', 'try']
                [
                    body
                    catch body
                    finally body
                ]
                async: true
            )

            (try expression) should contain fields (expected try expression)
