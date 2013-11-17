ms = require '../../lib/memorystream'
create parser = require './parser'.create parser
uglify = require 'uglify-js'
create terms () = require './codeGenerator'.code generator ()

beautify (code) =
    ast = uglify.parse (code)
    stream = uglify.Output Stream (beautify: true)
    ast.print (stream)
    stream.to string ()

generate code (term) =
    memory stream = new (ms.MemoryStream)
    term.generate java script module (memory stream)

    memory stream.to string ()

exports.compile (
    pogo
    filename: nil
    in scope: true
    ugly: false
    global: false
    return result: false
    async: false
    terms: create terms ()
) =
    parser = create parser (terms: terms)
    statements = parser.parse (pogo)

    if (async)
        statements.asyncify (return call to continuation: return result)

    module term = terms.module (
        statements
        in scope: in scope
        global: global
        return last statement: return result
    )

    code = generate code (module term)

    if (parser.errors.has errors ())
        memory stream = new (ms.MemoryStream)
        parser.errors.print errors (source location printer (filename: filename, source: pogo), memory stream)
        error = @new Error (memory stream.to string ())
        error.is semantic errors = true
        @throw error
    else
        if (ugly)
            code
        else
            beautify (code)

exports.evaluate (pogo, definitions: {}, ugly: true, global: false) =
    js = exports.compile (pogo, ugly: ugly, in scope: @not global, global: global, return result: @not global)
    definition names = Object.keys (definitions)

    parameters = definition names.join ','

    run script = new (Function (parameters, "return #(js);"))

    definition values = [definitions.(name), where: name <- definition names]

    run script.apply (undefined) (definition values)

source location printer (filename: nil, source: nil) =
    object =>
        self.lines in range (range) =
            lines = source.split r/\n/
            lines.slice (range.from - 1) (range.to)

        self.print lines in range (prefix: '', from: nil, to: nil, buffer: buffer) =
            for each @(line) in (self.lines in range (from: from, to: to))
                buffer.write (prefix + line + "\n")

        self.print location (location, buffer) =
            buffer.write (filename + ':' + location.first line + "\n")

            if (location.first line == location.last line)
                self.print lines in range (from: location.first line, to: location.last line, buffer: buffer)
                spaces = self.' ' times (location.first column)
                markers = self.'^' times (location.last column - location.first column)
                buffer.write (spaces + markers + "\n")
            else
                self.print lines in range (prefix: '> ', from: location.first line, to: location.last line, buffer: buffer)

        self.(s) times (n) =
            strings = []
            for (i = 0, i < n, ++i)
                strings.push (s)

            strings.join ''
