_ = require 'underscore'
create indent stack = require './indentStack'.create indent stack
create interpolation = require './interpolation'.create interpolation

exports.create parser context =
    create parser context (terms: nil) = {
        terms = terms

        indent stack = create indent stack ()

        tokens (tokens) =
            self.lexer.tokens = tokens
            tokens.shift ()

        set indentation (text) =
            self.indent stack.set indentation (text)

        unset indentation (token) =
            tokens = self.indent stack.unset indentation ()
            tokens.push (token)
            self.tokens (tokens)

        indentation (text) =
            tokens = self.indent stack.tokens for new line (text)
            self.tokens (tokens)

        eof () =
            self.tokens (self.indent stack.tokens for eof ())

        interpolation = create interpolation ()
        
        lex operator (parser context, op) =
          if (r/[?!][.;]/.test (op))
            parser context.tokens [op.0, op.1]
          else if (r/^(=>|\.\.\.|@:|[#@:!?,.=;]|:=)$/.test (op))
            op
          else
            'operator'
        
        loc (term, location) =
          loc = {
            first line = location.first_line
            last line = location.last_line
            first column = location.first_column
            last column = location.last_column
          }

          term.location () =
            loc

          term

        unindent (string) by (columns) =
          r = new (RegExp "\\n {#(columns)}" 'g')

          string.replace (r, "\n")

        normalise string (s) =
          s.substring (1, s.length - 1).replace (r/''/g, "'")

        parse reg exp (s) =
          match = r/^r\/((\n|.)*)\/([^\/]*)$/.exec(s)

          {
            pattern = match.1.replace(r/\\\//g, '/').replace(r/\n/, '\n')
            options = match.3
          }

        actual characters = [
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
        
        normalise interpolated string (s) =
          for each @(mapping) in (self.actual characters)
            s := s.replace (mapping.0, mapping.1)

          s

        compress interpolated string components (components) =
            compressed components = []
            last string = nil

            for each @(component) in (components)
                if (!last string && component.is string)
                    last string := component
                    compressed components.push (last string)
                else if (last string && component.is string)
                    last string.string = last string.string + component.string
                else
                    last string := nil
                    compressed components.push (component)

            compressed components

        unindent string components (components) by (columns) =
            _.map (components) @(component)
                if (component.is string)
                    self.terms.string (self.unindent (component.string) by (columns))
                else
                    component

        separate expression components (components) with strings =
            separated components = []
            last component was expression = false

            for each @(component) in (components)
                if (last component was expression && !component.is string)
                    separated components.push (self.terms.string '')

                separated components.push (component)
                last component was expression := !component.is string

            separated components

        normalise string components (components) unindenting by (indent columns) =
            self.separate expression components (
                self.compress interpolated string components (
                    self.unindent string components (components) by (indent columns)
                )
            ) with strings
    }
