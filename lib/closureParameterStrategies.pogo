_ = require 'underscore'
codegen utils = require './codegenUtils'

module.exports (terms) = {
    function strategy (strategy) = {
        strategy = strategy
        generate java script parameters (buffer, scope) =
            codegen utils.write (self.strategy.named parameters (), ',') to buffer (buffer, scope) with delimiter

        generate java script parameter statements (buffer, scope, args) =
            self.strategy.generate java script parameter statements (buffer, scope, args)

        named parameters () = strategy.named parameters ()
    }

    normal strategy (parameters) = {
        parameters = parameters
        named parameters () = self.parameters
        generate java script parameter statements (buffer, scope, args) = nil
    }

    splat strategy (before: nil, splat: nil, after: nil) = {
        before = before
        splat = splat
        after = after

        named parameters () = self.before

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

            for (n = 0, n < self.after.length, n = n + 1)
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

            named parameters () = self.before.concat [self.options variable]

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

    callback strategy (strategy) = {
        strategy = strategy

        named parameters () =
            self.strategy.named parameters ().concat (terms.callback function)

        generate java script parameter statements (buffer, scope, args) =
            inner args = terms.generated variable ['arguments']
            buffer.write "var "
            inner args.generate java script (buffer, scope)
            buffer.write "=Array.prototype.slice.call("
            args.generate java script (buffer, scope)
            buffer.write ",0,"
            args.generate java script (buffer, scope)
            buffer.write ".length-1);"
            terms.callback function.generate java script (buffer, scope)
            buffer.write "="
            args.generate java script (buffer, scope)
            buffer.write "["
            args.generate java script (buffer, scope)
            buffer.write ".length-1];"
            buffer.write "if(!("
            terms.callback function.generate java script (buffer, scope)
            buffer.write " instanceof Function)){throw new Error('asynchronous function called synchronously');}"

            named parameters = self.strategy.named parameters ()
            for (n = 0, n < named parameters.length, n = n + 1)
                named param = self.strategy.named parameters ().(n)
                named param.generate java script (buffer, scope)
                buffer.write "="
                inner args.generate java script (buffer, scope)
                buffer.write "[#(n)];"

            self.strategy.generate java script parameter statements (buffer, scope, inner args)
    }
}
