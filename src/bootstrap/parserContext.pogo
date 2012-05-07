create indent stack = require './indentStack'.create indent stack
create interpolation = require './interpolation'.create interpolation

exports.create parser context =
    create parser context (terms: nil) = object =>
        self.terms = terms

        self.indent stack = create indent stack ()

        self.tokens (tokens) =
            self.lexer.tokens = tokens
            tokens.shift ()

        self.set indentation (text) =
            self.indent stack.set indentation (text)

        self.unset indentation (token) =
            tokens = self.indent stack.unset indentation ()
            tokens.push (token)
            self.tokens (tokens)

        self.indentation (text) =
            tokens = self.indent stack.tokens for new line (text)
            self.tokens (tokens)

        self.eof () =
            self.tokens (self.indent stack.tokens for eof ())

        self.interpolation = create interpolation ()