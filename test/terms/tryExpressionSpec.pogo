terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'

describe 'try expression term'
    describe 'returning as last statement'
        it 'returns last statement from body and catch body'
            expression =
                terms.closure (
                    []
                    terms.statements [
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
                    ]
                )

            expected try expression = 
                terms.closure (
                    []
                    terms.statements [
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
                    ]
                    return last statement: false
                )

            (expression) should contain fields (expected try expression)
