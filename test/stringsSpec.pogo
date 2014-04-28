script = require './scriptAssertions'

shouldOutput = script.shouldOutput
shouldThrow = script.shouldThrow

describe 'strings'
    describe 'multiline'
        context 'when strings are over multiple lines'
            it 'removes the indent'
                "x = 'one
                      two'
                 
                 print (x)" shouldOutput "'one\\ntwo'"

            it 'removes the indent'
                "x = \"one\r\n     two\"\r\nprint(x)" shouldOutput "'one\\ntwo'"

            it 'removes the indent'
                "x = 'one\r\n     two'\r\nprint(x)" shouldOutput "'one\\ntwo'"

    describe 'interpolated strings'
        describe 'escaping'
            itCanEscape (name) with (character) =
                it "can escape #(name) with \\#(character)"
                    "x = \"\\#(character)\"
                     print(x)" shouldOutput "'\\#(character)'"

            itCanEscape 'carriage return' with 'r'
            itCanEscape 'newline' with 'n'
            itCanEscape 'tab' with 't'

        describe 'interpolation'
            it 'can interpolate values'
                'x = 8
                 print ("x is #(x)")' shouldOutput "'x is 8'"
