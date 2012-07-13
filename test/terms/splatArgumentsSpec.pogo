terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require '../assertions'

describe 'splat arguments'
    it 'returns the argument if there is only one'
        splatted = terms.splat arguments (
            [
                terms.variable ['a']
                terms.splat ()
            ]
        )

        (splatted) should contain fields (terms.variable ['a'])

    it 'puts leading arguments into a list'
        splatted = terms.splat arguments (
            [
                terms.variable ['a']
                terms.variable ['b']
                terms.splat ()
            ]
        )

        (splatted) should contain fields (
            terms.method call (
                terms.list [terms.variable ['a']]
                ['concat']
                [
                    terms.variable ['b']
                ]
            )
        )

    it 'puts remaining arguments into a list'
        splatted = terms.splat arguments (
            [
                terms.variable ['a']
                terms.variable ['b']
                terms.splat ()
                terms.variable ['c']
                terms.variable ['d']
                terms.splat ()
                terms.variable ['e']
                terms.variable ['f']
            ]
        )

        (splatted) should contain fields (
            terms.method call (
                terms.method call (
                    terms.method call (
                        terms.method call (
                            terms.list [terms.variable ['a']]
                            ['concat']
                            [
                                terms.variable ['b']
                            ]
                        )
                        ['concat']
                        [
                            terms.list [terms.variable ['c']]
                        ]
                    )
                    ['concat']
                    [
                        terms.variable ['d']
                    ]
                )
                ['concat']
                [
                    terms.list [
                        terms.variable ['e']
                        terms.variable ['f']
                    ]
                ]
            )
        )
