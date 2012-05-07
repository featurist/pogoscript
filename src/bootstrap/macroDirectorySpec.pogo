require './assertions.pogo'

md = require './codeGenerator/macroDirectory.pogo'
seq = md.seq
kw = md.kw
zero or more = md.zero or more
opt = md.opt

describe 'macro pattern compiler'
    pattern compiler = md.create pattern compiler ()
    compile (pattern) = pattern compiler.compile pattern (pattern)

    it 'should compile a sequence of keywords
          into regexp for sequence'
        regexp = compile (seq [kw 'a', kw 'b'])

        (regexp.source) should equal (`a;b;`.source)

    it 'can compile a sequence of zero or more "if else" keywords'
        regexp = compile (seq [kw 'if', zero or more (seq [kw 'else', kw 'if']), kw 'else'])

        (regexp.source) should equal (`if;(else;if;)*else;`.source)

    it 'can compile a "try/catch" sequence with an optional "finally" keyword'
        regexp = compile (seq [kw 'try', kw 'catch', opt (kw 'finally')])

        (regexp.source) should equal (`try;catch;(finally;)?`.source)
