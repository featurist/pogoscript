ms = require '../memorystream'
createParser = require './parser'.createParser
createTerms = require './codeGenerator'.codeGenerator
object = require './runtime'.object
sm = require 'source-map'

beautify (code) =
    uglify = require 'uglify-js'
    ast = uglify.parse (code)
    stream = uglify.OutputStream (beautify: true)
    ast.print (stream)
    stream.toString ()

serialise (code) =
    if (code :: sm.SourceNode)
        code
    else
        @new sm.SourceNode (0, 0, 0, code)

exports.generateCode (
    term
    terms
    inScope: true
    global: false
    returnResult: false
    outputFilename: outputFilename
    sourceMap: false
) =
    moduleTerm = terms.module (
        term
        inScope: inScope
        global: global
        returnLastStatement: returnResult
    )

    code = serialise (moduleTerm.generateModule ())

    if (sourceMap)
        code.toStringWithSourceMap (file: outputFilename)
    else
        code.toString ()

exports.compile (
    pogo
    filename: nil
    inScope: true
    ugly: false
    global: false
    returnResult: false
    async: false
    outputFilename: nil
    sourceMap: false
    promises: nil
    terms: createTerms (promises: promises)
) =
    parser = createParser (terms: terms, filename: filename)
    statements = parser.parse (pogo)

    if (async)
        statements.asyncify (returnCallToContinuation: returnResult)

    output = exports.generateCode (statements, terms, inScope: inScope, global: global, returnResult: returnResult, outputFilename: outputFilename, sourceMap: sourceMap)

    if (parser.errors.hasErrors ())
        memoryStream = new (ms.MemoryStream)
        parser.errors.printErrors (sourceLocationPrinter (filename: filename, source: pogo), memoryStream)
        error = @new Error (memoryStream.toString ())
        error.isSemanticErrors = true
        @throw error
    else if (sourceMap)
        output.map.setSourceContent (filename, pogo)

        {
            code = output.code
            map = JSON.parse (output.map.toString ())
        }
    else
        if (@not ugly)
            beautify (output)
        else
            output

exports.evaluate (pogo, definitions: {}, ugly: true, global: false) =
    js = exports.compile (pogo, ugly: ugly, inScope: @not global, global: global, returnResult: @not global)
    definitionNames = Object.keys (definitions)

    parameters = definitionNames.join ','

    runScript = new (Function (parameters, "return #(js);"))

    definitionValues = [name <- definitionNames, definitions.(name)]

    runScript.apply (undefined, definitionValues)

sourceLocationPrinter (filename: nil, source: nil) =
    {
        linesInRange (range) =
            lines = source.split r/\n/
            lines.slice (range.from - 1) (range.to)

        printLinesInRange (prefix: '', from: nil, to: nil, buffer: buffer) =
            for each @(line) in (self.linesInRange (from: from, to: to))
                buffer.write (prefix + line + "\n")

        printLocation (location, buffer) =
            buffer.write (filename + ':' + location.firstLine + "\n")

            if (location.firstLine == location.lastLine)
                self.printLinesInRange (from: location.firstLine, to: location.lastLine, buffer: buffer)
                spaces = self.' ' times (location.firstColumn)
                markers = self.'^' times (location.lastColumn - location.firstColumn)
                buffer.write (spaces + markers + "\n")
            else
                self.printLinesInRange (prefix: '> ', from: location.firstLine, to: location.lastLine, buffer: buffer)

        (s) times (n) =
            strings = []
            for (i = 0, i < n, ++i)
                strings.push (s)

            strings.join ''
    }

exports.lex (pogo) =
    parser = createParser (terms: createTerms ())
    parser.lex (pogo)
