terms = require '../../lib/parser/codeGenerator'.code generator ()
require '../assertions'
require '../codeGeneratorAssertions'

describe 'interpolated string'
    describe 'code generation'
        it 'builds the string using the + operator'
            str = terms.interpolated string [terms.string 'hello, ', terms.variable ['name']]
            
            (str) should generate statement "('hello, '+name);"
