fs = require 'fs'
preparser = require './preparser'
ms = require '../lib/memorystream'
parse = require './parser': parse
uglify = require 'uglify-js'
errors = require './codeGenerator/errors'

preparse = preparser: create file parser!

generate code @term =
  memory stream = new (ms: MemoryStream)
  term: generate java script (memory stream)
  memory stream: to string?

beautify @code =
  ast = uglify: parser: parse @code
  uglify: uglify: gen_code @ast, beautify

exports: compile file @filename =
  js = js from pogo file @filename
  beautiful js = beautify @js
  js filename = js filename from pogo filename @filename
  fs: write file sync (js filename) (beautiful js)

js filename from pogo filename @pogo =
  pogo: replace (new (RegExp '\.pogo$')) '' + '.js'

exports: run file @filename =
  js = js from pogo file @filename
  
  module: filename = fs: realpath sync @filename
  process: argv: 1 = module: filename
  module: _compile @js @filename

js from pogo file @filename =
  contents = fs: read file sync @filename 'utf-8'
  p = preparse @contents
  term = parse @p
  
  if (errors: has errors?)
    errors: print errors (source location printer, filename @filename, source @contents)
    process: exit 1
  else
    generate code @term

source location printer, filename, source =
  object =>
    :lines in range @range =
      lines = source: split (new (RegExp '\n'))
      lines: slice (range:from - 1) (range:to)

    :print lines in range @range =
      for each ?line in (:lines in range @range)
          process:stderr:write (line + '\n')

    :print location @location =
      process:stderr:write (filename + ':' + location: first line + '\n')
      :print lines in range, from (location: first line), to (location: last line)
      spaces = :duplicate string ' ' (location: first column) times
      markers = :duplicate string '^' (location: last column - location:first column) times
      process:stderr:write (spaces + markers + '\n')

    :duplicate string @s @n times =
        strings = []
        for {i = 0} {i < n} {i = i + 1}
          strings: push @s

        strings: join ''

require: extensions: '.pogo' = ?module ?filename
  content = js from pogo file @filename
  module: _compile @content @filename
