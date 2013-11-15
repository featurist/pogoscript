_ = require 'underscore'
grammar = require '../parser/grammar'

exports.write to buffer with delimiter (array, delimiter, buffer, scope) =
  writer = nil
  if (scope :: Function)
      writer := scope
  else
      writer (item) :=
          item.generate java script (buffer, scope)
  
  first = true

  _ (array).each @(item)
      if (!first)
          buffer.write (delimiter)

      first := false
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
        s := s.replace (mapping.0, mapping.1)

    "'" + s + "'"

exports.concat name (name segments, options) =
    name = ''
  
    for (n = 0, n < name segments.length, ++n)
        segment = name segments.(n)
        name := name + name segment rendered in java script (segment, n == 0)

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
    for (n = 0, n < operator.length, ++n)
        java script name := java script name + '$' + operator.char code at (n).to string (16)

    java script name

capitalise (s) =
    s.0.to upper case () + s.substring (1)

reserved words = {
    class
    function
    else
    case
    switch
}

escape reserved word (word) =
    if (reserved words.has own property (word))
        '$' + word
    else
        word

exports.concat args (args, optional args: nil, async callback arg: nil, terms: nil) =
    a = args.slice ()

    if (optional args && (optional args.length > 0))
        a.push (terms.hash (optional args))

    if (async callback arg)
        a.push (async callback arg)

    a

exports.normalise operator name (name) =
        op = @new RegExp "^@(#(grammar.identifier))$"
        match = op.exec (name)
        if (match)
            match.1
        else
            name

exports.defined variables (scope) = {
    variables = []
    scope = scope

    define (variable) =
        scope.define (variable)
        self.variables.push (variable)

    is (variable) defined = scope.is (variable) defined
    is (variable) defined in this scope = scope.is (variable) defined in this scope

    unique variables () = _.uniq (self.variables)
}
