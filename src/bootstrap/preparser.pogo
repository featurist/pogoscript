fs = require 'fs'
ms = require '../lib/memorystream'
require './runtime.pogo'

exports: new line parser = new line parser? =
  last indentation = ''
  indentation pattern = new (RegExp '^( *)(.*)$')
  is empty line pattern = new (RegExp '^\s*$')
  line ends with bracket pattern = new (RegExp '[{([]\s*$')
  line starts with bracket pattern = new (RegExp '^\s*[\])}]')
  is first line = true
  
  @line is empty =
    is empty line pattern: test @line

  @line starts with bracket =
    line starts with bracket pattern: test @line

  @line ends with bracket =
    line ends with bracket pattern: test @line

  ?line
      if (@line is empty)
        line = {is empty, line @line, is first line (is first line)}
        line
      else
        indentation match = indentation pattern: exec @line
        indentation = indentation match: 1
        code = indentation match: 2

        line = {
          line @line
          code @code
          indentation @indentation
          is indent (indentation > last indentation)
          is unindent (indentation < last indentation)
          is new line (indentation == last indentation)
          ends with bracket (@line ends with bracket)
          starts with bracket (@line starts with bracket)
          is first line (is first line)
        }

        is first line = false
        last indentation = indentation

        line

exports: new indent stack = new indent stack? =
  indents = ['']
  peek @array = array: (array: length - 1)

  object =>
    this: indent to @i =
      indents: push @i

    this: count unindents while unwinding to @i =
      unindent count = 0

      while @{peek @indents != i}
        unindent count = unindent count + 1
        indents: pop!

      unindent count

exports: new file parser? =
  ?source
    lines = source: split "\n"
    last line = {no line}
    parse = new line parser?

    stream = new (ms: MemoryStream!)

    indent stack = new indent stack?

    @s plus @a if @c =
      if @c
        s + a
      else
        s

    write @l =
      if (not (l: no line))
        stream: write (l: line: replace (new (RegExp '\\' 'g')) '\\' + "\n")

    write @l appending @s =
      if (not (l: no line))
        stream: write (l: line: replace (new (RegExp '\\' 'g')) '\\' + s + "\n")

    concat @s @n times =
      r = ''
      while @{n > 0}
        r = r + s
        n = n - 1

      r
    
    for each ?sline in @lines
      line = parse @sline

      if (line: is new line)
        write (last line) appending ('' plus '\.' if (not (((line: is first line) or (last line: ends with bracket)) or (line: starts with bracket))))

      if (line: is empty)
        write (last line)

      if (line: is indent)
        write (last line) appending ('' plus '\@{' if (not (last line: ends with bracket)))
        indent stack: indent to (line: indentation)

      if (line: is unindent)
        number of unwind brackets = indent stack: count unindents while unwinding to (line: indentation)

        if (line: starts with bracket)
          number of unwind brackets = number of unwind brackets - 1

        last line ending = concat '\}' (number of unwind brackets) times

        write (last line) appending ((last line ending) plus '\.' if (last line: is empty))

      last line = line

    number of unwind brackets = indent stack: count unindents while unwinding to ''
    write (last line) appending (concat '\}' (number of unwind brackets) times)

    stream: to string?
