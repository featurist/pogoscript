object = require './runtime'.object
_ = require 'underscore'
createIndentStack = require './indentStack'.createIndentStack
createInterpolation = require './interpolation'.createInterpolation

exports.createParserContext =
    createParserContext (terms: nil, filename: nil) = {
        terms = terms

        indentStack = createIndentStack ()

        tokens (tokens) =
            self.lexer.tokens = tokens
            tokens.shift ()

        setIndentation (text) =
            self.indentStack.setIndentation (text)

        unsetIndentation (token) =
            tokens = self.indentStack.unsetIndentation ()
            tokens.push (token)
            self.tokens (tokens)

        indentation (text) =
            tokens = self.indentStack.tokensForNewLine (text)
            self.tokens (tokens)

        eof () =
            self.tokens (self.indentStack.tokensForEof ())

        interpolation = createInterpolation ()
        
        lexOperator (parserContext, op) =
          if (r/^!\.|\^!$/.test (op))
            parserContext.tokens [op.0, op.1]
          else if (r/^\^!\.$/.test (op))
            parserContext.tokens [op.0, op.1, op.2]
          else if (r/^\^\.$/.test (op))
            parserContext.tokens [op.0, op.1]
          else if (r/^(=>|\.\.\.|@:|[#@:!?^,.=;]|:=)$/.test (op))
            op
          else
            'operator'
        
        loc (term, location) =
          loc = {
            firstLine = location.first_line
            lastLine = location.last_line
            firstColumn = location.first_column
            lastColumn = location.last_column
            filename = filename
          }

          term.setLocation (loc)

          term

        unindent (string) by (columns) =
          r = new (RegExp "\\n {#(columns)}" 'g')

          string.replace (r, "\n")

        normaliseString (s) =
          s.substring (1, s.length - 1).replace (r/''/g, "'").replace ("\r", "")

        parseRegExp (s) =
          match = r/^r\/((\n|.)*)\/([^\/]*)$/.exec(s)

          {
            pattern = match.1.replace(r/\\\//g, '/').replace(r/\n/, '\n')
            options = match.3
          }

        actualCharacters = [
          [r/\r/g, '']
          [r/\\\\/g, "\\"]
          [r/\\b/g, "\b"]
          [r/\\f/g, "\f"]
          [r/\\n/g, "\n"]
          [r/\\0/g, "\0"]
          [r/\\r/g, "\r"]
          [r/\\t/g, "\t"]
          [r/\\v/g, "\v"]
          [r/\\'/g, "'"]
          [r/\\"/g, '"']
        ]
        
        normaliseInterpolatedString (s) =
          for each @(mapping) in (self.actualCharacters)
            s := s.replace (mapping.0, mapping.1)

          s

        compressInterpolatedStringComponents (components) =
            compressedComponents = []
            lastString = nil

            for each @(component) in (components)
                if (!lastString && component.isString)
                    lastString := component
                    compressedComponents.push (lastString)
                else if (lastString && component.isString)
                    lastString.string = lastString.string + component.string
                else
                    lastString := nil
                    compressedComponents.push (component)

            compressedComponents

        unindentStringComponents (components) by (columns) =
            _.map (components) @(component)
                if (component.isString)
                    self.terms.string (self.unindent (component.string) by (columns))
                else
                    component

        separateExpressionComponents (components) withStrings =
            separatedComponents = []
            lastComponentWasExpression = false

            for each @(component) in (components)
                if (lastComponentWasExpression && !component.isString)
                    separatedComponents.push (self.terms.string '')

                separatedComponents.push (component)
                lastComponentWasExpression := !component.isString

            separatedComponents

        normaliseStringComponents (components) unindentingBy (indentColumns) =
            self.separateExpressionComponents (
                self.compressInterpolatedStringComponents (
                    self.unindentStringComponents (components) by (indentColumns)
                )
            ) withStrings
    }
