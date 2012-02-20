fs = require 'fs'
ms = require '../lib/memorystream'
parser = require './parser'
parse = parser: parse
uglify = require 'uglify-js'
errors = require './codeGenerator/errors'

generate code @term =
    memory stream = new (ms : MemoryStream)
    term : generate java script (memory stream)
    memory stream : to string?

beautify @code =
    ast = uglify : parser : parse @code
    uglify : uglify : gen_code @ast, beautify

:compile file = compile file @filename, ugly =
    js = js from pogo file @filename
    if (not @ugly)
        js = beautify @js
        
    js filename = js filename from pogo filename @filename
    fs : write file sync (js filename) @js

when @filename changes @act =
    fs : watch file @filename {persistent. interval 500} #prev #curr
        if ((curr:size === prev:size) && (curr:mtime:get time? === prev:mtime:get time?))
            return
        
        act!

:watch file @filename @options =
    compile! =
        compile file @filename @options

    compile!

    when @filename changes
        console : log "compiling @filename => @(js filename from pogo filename @filename)"
        compile!

:lex file @filename =
    source = fs : read file sync @filename 'utf-8'
    tokens = parser: lex @source
    
    for each #token in @tokens
        console: log "<@token>"

js filename from pogo filename @pogo =
    pogo : replace `\.pogo$` '' + '.js'

:run file @filename =
    js = js from pogo file @filename
    
    module : filename = fs : realpath sync @filename
    process : argv : shift!
    process : argv : 0 = 'pogo'
    
    module : _compile @js @filename

js from pogo file @filename =
    contents = fs : read file sync @filename 'utf-8'
    term = parse @contents
    
    code = generate code @term

    if (errors : has errors?)
        errors : print errors (source location printer, filename @filename, source @contents)
        process : exit 1
    else
        code
        
source location printer, filename, source =
    object =>
        : lines in range @range =
            lines = source : split `\n`
            lines : slice (range : from - 1) (range : to)

        : print lines in range, prefix '', from, to =
            for each #line in (: lines in range, from @from, to @to)
                process : stderr : write (prefix + line + "\n")

        : print location @location =
            process : stderr : write (filename + ':' + location : first line + "\n")

            if (location : first line == location : last line)
                : print lines in range, from (location : first line), to (location : last line)
                spaces = : ' ' times (location : first column)
                markers = : '^' times (location : last column - location : first column)
                process : stderr : write (spaces + markers + "\n")
            else
                : print lines in range, prefix '> ', from (location : first line), to (location : last line)

        : @s times @n =
            strings = []
            for @{i = 0} @{i < n} @{i = i + 1}
                strings : push @s

            strings : join ''

require : extensions : '.pogo' @module @filename =
    content = js from pogo file @filename
    module : _compile @content @filename
