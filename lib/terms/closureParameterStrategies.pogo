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
            buffer.write (self.splat.generate (scope))

            buffer.write "=Array.prototype.slice.call("
            buffer.write (args.generate (scope))
            buffer.write ",#(self.before.length),"
            buffer.write (args.generate (scope))
            buffer.write ".length"

            if (self.after.length > 0)
                buffer.write "-#(self.after.length)"

            buffer.write ");"

            if ((before.length > 0) && (after.length > 0))
                buffer.write "if("
                buffer.write (args.generate (scope))
                buffer.write ".length>#(before.length)){"

            for (n = 0, n < self.after.length, ++n)
                after arg = self.after.(n)
                args index = self.after.length - n
                buffer.write "var "
                buffer.write (after arg.generate (scope))
                buffer.write "="
                buffer.write (args.generate (scope))
                buffer.write "["
                buffer.write (args.generate (scope))
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
                    buffer.write (self.options variable.generate (scope))
                    buffer.write "!==void 0&&Object.prototype.hasOwnProperty.call("
                    buffer.write (self.options variable.generate (scope))
                    buffer.write ",'#(option name)')&&"
                    buffer.write (self.options variable.generate (scope))
                    buffer.write ".#(option name)!==void 0?"
                    buffer.write (self.options variable.generate (scope))
                    buffer.write ".#(option name):"
                    buffer.write (option.value.generate (scope))
                    buffer.write ";"
        }
}
