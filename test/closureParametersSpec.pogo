terms = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
should contain fields = require './containsFields'.contains fields

describe 'closure parameters'
    describe 'parameter interpretation'
        context 'when there are only normal parameters'
            it 'outputs each parameter in the parameters
                and outputs no additional body statements'

                params = terms.closure parameters [terms.variable ['a'], terms.variable ['b']]
                (params) should contain fields (
                    terms.normal parameters [
                        terms.variable ['a'], terms.variable ['b']
                    ]
                )

        describe 'splat parameters'
            context 'when there is a splat parameter at the end'
                it 'outputs each parameter in the parameters
                    and outputs no additional body statements'

                    params = terms.closure parameters [terms.variable ['a'], terms.variable ['b'], terms.splat ()]
                    (params) should contain fields (
                        terms.splat parameters [
                            terms.variable ['a'], terms.variable ['b'], terms.splat ()
                        ]
                    )
