parser context = require '../src/bootstrap/parserContext'
cg = require '../lib/codeGenerator'
should contain fields = require './containsFields'.contains fields

describe 'parser context'
    context = parser context.create parser context ()

    describe 'compress interpolated string components'
        it 'joins contiguous string components together'
            components = context.compress interpolated string components [cg.string 'one', cg.string 'two']

            (components) should contain fields [{
                is string
                string 'onetwo'
            }]

        it 'joins two groups of contiguous string components together, separated by an expression'
            components = context.compress interpolated string components [
                cg.string 'one'
                cg.string 'two'
                cg.variable ['value']
                cg.string 'three'
                cg.string 'four'
            ]

            (components) should contain fields [
                {
                    is string
                    string 'onetwo'
                }
                {
                    variable ['value']
                }
                {
                    is string
                    string 'threefour'
                }
            ]

        it 'removes indentation from each string component'
            components = context.unindent string components [
                cg.string 'one'
                cg.string "\n      two"
                cg.string "\n        three"
            ] by 6

            (components) should contain fields [
                {
                    is string
                    string "one"
                }
                {
                    is string
                    string "\ntwo"
                }
                {
                    is string
                    string "\n  three"
                }
            ]
