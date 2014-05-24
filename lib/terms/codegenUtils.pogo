_ = require 'underscore'
grammar = require '../parser/grammar'

exports.writeToBufferWithDelimiter (array, delimiter, buffer, scope) =
  writer = nil
  if (scope :: Function)
      writer := scope
  else
      writer (item) :=
          buffer.write (item.generate (scope))
  
  first = true

  _ (array).each @(item)
      if (!first)
          buffer.write (delimiter)

      first := false
      writer (item)

actualCharacters = [
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

exports.formatJavaScriptString (s) =
    for each @(mapping) in (actualCharacters)
        s := s.replace (mapping.0, mapping.1)

    "'" + s + "'"

exports.concatName (nameSegments, options) =
    name = ''

    for (n = 0, n < nameSegments.length, ++n)
        segment = nameSegments.(n)
        name := name + nameSegmentRenderedInJavaScript (segment, n == 0)

    if ((options && options.hasOwnProperty ('escape')) && options.escape)
        escapeReservedWord (name)
    else
        name

nameSegmentRenderedInJavaScript (nameSegment, isFirst) =
    if (r/[_$a-zA-Z0-9]+/.test (nameSegment))
        if (isFirst)
            nameSegment
        else
            capitalise (nameSegment)
    else
        operatorRenderedInJavaScript (nameSegment)

operatorRenderedInJavaScript (operator) =
    javaScriptName = ''
    for (n = 0, n < operator.length, ++n)
        javaScriptName := javaScriptName + '$' + operator.charCodeAt (n).toString (16)

    javaScriptName

capitalise (s) =
    s.0.toUpperCase () + s.substring (1)

reservedWords = {
    class
    function
    else
    case
    switch
}

escapeReservedWord (word) =
    if (reservedWords.hasOwnProperty (word))
        '$' + word
    else
        word

exports.concatArgs (args, optionalArgs: nil, asyncCallbackArg: nil, terms: nil) =
    a = args.slice ()

    if (optionalArgs && (optionalArgs.length > 0))
        a.push (terms.hash (optionalArgs))

    if (asyncCallbackArg)
        a.push (asyncCallbackArg)

    a

exports.normaliseOperatorName (name) =
        op = @new RegExp "^@(#(grammar.identifier))$"
        match = op.exec (name)
        if (match)
            match.1
        else
            name

exports.definedVariables (scope) = {
    variables = []
    scope = scope

    define (variable) =
        scope.define (variable)
        self.variables.push (variable)

    define (name) withTag (tag) = scope.define (name) withTag (tag)

    generateVariable (name) = scope.generateVariable (name)

    is (variable) defined = scope.is (variable) defined
    is (variable) definedInThisScope = scope.is (variable) definedInThisScope

    names () = _.uniq (self.variables)
}
