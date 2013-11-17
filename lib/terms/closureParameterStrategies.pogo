_ = require 'underscore'
codegen utils = require './codegenUtils'

module.exports (terms) = {
    function strategy (strategy) = {
        strategy = strategy
        generate java script parameters (buffer, scope) =
            codegen utils.write (self.strategy.function parameters (), ',') to buffer (buffer, scope) with delimiter

        generate java script parameter statements (buffer, scope, args) =
            self.strategy.generate java script parameter statements (buffer, scope, args)

        function parameters () = strategy.function parameters ()
        defined parameters () = strategy.defined parameters ()
    }

    normal strategy (parameters) = {
        parameters = parameters
        function parameters () = self.parameters
        generate java script parameter statements (buffer, scope, args) = nil
        defined parameters () = self.parameters
    }

    splat strategy (before: nil, splat: nil, after: nil) = {
        before = before
        splat = splat
        after = after

        function parameters () = self.before

        defined parameters () = self.before.concat [self.splat].concat (self.after)

        generate java script parameter statements (buffer, scope, args) =
            buffer.write "var "
            self.splat.generate java script (buffer, scope)

            buffer.write "=Array.prototype.slice.call("
            args.generate java script (buffer, scope)
            buffer.write ",#(self.before.length),"
            args.generate java script (buffer, scope)
            buffer.write ".length"

            if (self.after.length > 0)
                buffer.write "-#(self.after.length)"

            buffer.write ");"

            if ((before.length > 0) && (after.length > 0))
                buffer.write "if("
                args.generate java script (buffer, scope)
                buffer.write ".length>#(before.length)){"

            for (n = 0, n < self.after.length, ++n)
                after arg = self.after.(n)
                args index = self.after.length - n
                buffer.write "var "
                after arg.generate java script (buffer, scope)
                buffer.write "="
                args.generate java script (buffer, scope)
                buffer.write "["
                args.generate java script (buffer, scope)
                buffer.write ".length-#(args index)];"

            if ((before.length > 0) && (after.length > 0))
                buffer.write "}"
    }

    optional strategy (before: nil, options: nil) =
        {
            before = before
            options = options
            options variable = terms.generated variable ['options']

            function parameters () = self.before.concat [self.options variable]
            defined parameters () = before.concat [param, where: option <- self.options, param = terms.variable (option.field)]

            generate java script parameter statements (buffer, scope, args) =
                option names = _.map (self.options) @(option)
                    codegen utils.concat name (option.field)

                buffer.write "var "
                buffer.write (option names.join ',')
                buffer.write ";"

                for each @(option) in (self.options)
                    option name = codegen utils.concat name (option.field)
                    buffer.write "#(option name)="
                    self.options variable.generate java script (buffer, scope)
                    buffer.write "!==void 0&&Object.prototype.hasOwnProperty.call("
                    self.options variable.generate java script (buffer, scope)
                    buffer.write ",'#(option name)')&&"
                    self.options variable.generate java script (buffer, scope)
                    buffer.write ".#(option name)!==void 0?"
                    self.options variable.generate java script (buffer, scope)
                    buffer.write ".#(option name):"
                    option.value.generate java script (buffer, scope)
                    buffer.write ";"
        }

    callback strategy (strategy, continuation or default: nil) =
        {
            strategy = strategy

            function parameters () =
                self.strategy.function parameters ().concat (terms.callback function)

            defined parameters () = strategy.defined parameters ().concat [terms.callback function]

            generate java script parameter statements (buffer, scope, args) =
                gen (terms, ...) =
                    for each @(term) in (terms)
                        if (term :: String)
                            buffer.write (term)
                        else
                            term.generate java script (buffer, scope)

                inner args = terms.generated variable ['arguments']

                gen ("var ", inner args, "=Array.prototype.slice.call(", args, ",0,", args, ".length-1);")
                gen (terms.callback function, "=", continuation or default, "(", args, ");")

                function parameters = self.strategy.function parameters ()
                for (n = 0, n < function parameters.length, ++n)
                    named param = self.strategy.function parameters ().(n)

                    gen (named param, "=", inner args, "[#(n)];")

                self.strategy.generate java script parameter statements (buffer, scope, inner args)
        }
}
