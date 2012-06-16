_ = require 'underscore'

exports.write to buffer with delimiter (array, delimiter, buffer, scope) =
  writer = nil
  if (scope :: Function)
      writer = scope
  else
      writer (item) =
          item.generate java script (buffer, scope)
  
  first = true

  _ (array).each @(item)
      if (!first)
          buffer.write (delimiter)

      first = false
      writer (item)

actual characters = [
    [r/\\/g, '\\']
    [new (RegExp "\b", 'g'), '\b']
    [r/\f/g, '\f']
    [r/\n/g, '\n']
    [r/\0/g, '\0']
    [r/\r/g, '\r']
    [r/\t/g, '\t']
    [r/\v/g, '\v']
    [r/'/g, '\''']
    [r/"/g, '\"']
]

exports.format java script string (s) =
    for each @(mapping) in (actual characters)
        s = s.replace (mapping.0, mapping.1)

    "'" + s + "'"

exports.concat name (name segments, options) =
    name = ''
  
    for (n = 0, n < name segments.length, n = n + 1)
        segment = name segments.(n)
        name = name + name segment rendered in java script (segment, n == 0)

    if ((options && options.has own property ('escape')) && options.escape)
        escape reserved word (name)
    else
        name

name segment rendered in java script (name segment, is first) =
    if (r/[_$a-zA-Z0-9]+/.test (name segment))
        if (is first)
            name segment
        else
            capitalise (name segment)
    else
        operator rendered in java script (name segment)

operator rendered in java script (operator) =
    java script name = ''
    for (n = 0, n < operator.length, n = n + 1)
        java script name = java script name + '$' + operator.char code at (n).to string (16)

    java script name

capitalise (s) =
    s.0.to upper case () + s.substring (1)

reserved words = {
  class
  function
}

escape reserved word (word) =
    if (reserved words.has own property (word))
        '$' + word
    else
        word

exports.splatted arguments (cg, args, optional args) =
  splat args = []
  previous args = []
  found splat = false
  
  i = 0
  while (i < args.length)
    current = args.(i)
    next = args.(i + 1)
    if (next && next.is splat)
      found splat = true
      if (previous args.length > 0)
        splat args.push (cg.list (previous args))
        previous args = []

      splat args.push (current)
      i = i + 1
    else if (current.is splat)
      cg.errors.add term (current) with message 'splat keyword with no argument to splat'
    else
      previous args.push (current)

    i = i + 1
  
  if (optional args && (optional args.length > 0))
    previous args.push (cg.hash (optional args))
  
  if (previous args.length > 0)
    splat args.push (cg.list (previous args))
  
  if (found splat)
    cg.old term =>
      self.generate java script (buffer, scope) =
        for (i = 0, i < splat args.length, i = i + 1)
          splatted argument = splat args.(i)

          if (i == 0)
            splatted argument.generate java script (buffer, scope)
          else
            buffer.write ('.concat(')
            splatted argument.generate java script (buffer, scope)
            buffer.write (')')

exports.args and optional args (cg, args, optional args) =
  a = args.slice ()

  if (optional args && (optional args.length > 0))
    a.push (cg.hash (optional args))

  a
