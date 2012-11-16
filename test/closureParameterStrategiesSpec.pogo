terms = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
strategies = (require '../lib/closureParameterStrategies') (terms)
Memory Stream = require '../lib/memorystream'.Memory Stream
should = require 'should'

describe 'closure parameter strategies'
    generate with buffer and scope (block) =
        scope = new (terms.Symbol Scope)
        buffer = new (Memory Stream)
        block (buffer, scope)
        buffer.to string ()

    generate parameters from (strategy) =
        generate with buffer @(buffer) and scope @(scope)
            strategy.generate java script parameters (buffer, scope)

    generate statements from (strategy) =
        generate with buffer @(buffer) and scope @(scope)
            strategy.generate java script parameter statements (buffer, scope, terms.variable ['args'])

    describe 'function strategy'
        context 'when there are two arguments'
            fs = nil

            before each
                fs := strategies.function strategy {
                    named parameters () = [
                        terms.variable ['a']
                        terms.variable ['b']
                    ]

                    generate java script parameter statements (buffer, scope, arguments) =
                        arguments.generate java script (buffer, scope)
                        buffer.write ";"
                }

            it 'generates a function parameter for each required parameter'
                generate parameters from (fs).should.equal 'a,b'

            it "generates statements of underlying strategy"
                generate statements from (fs).should.equal 'args;'

            it "requires underlying named parameters"
                should.deep equal (fs.named parameters (), [terms.variable ['a'], terms.variable ['b']])

    describe 'normal strategy'
        context 'when there are two parameters'
            n = nil

            before each
                n := strategies.normal strategy [
                    terms.variable ['a']
                    terms.variable ['b']
                ]

            it 'requires those parameters'
                should.deep equal (n.named parameters (), [terms.variable ['a'], terms.variable ['b']])

            it "doesn't generate any statements"
                generate statements from (n).should.equal ''

    describe 'splat strategy'
        context 'when there is only one splat parameter'
            splat = nil

            before each
                splat := strategies.splat strategy (
                    before: []
                    splat: terms.variable ['a']
                    after: []
                )

            it "doesn't require any parameters"
                should.deep equal (splat.named parameters (), [])

            it 'generates full slice of arguments'
                generate statements from (splat).should.equal 'var a=Array.prototype.slice.call(args,0,args.length);'

        context 'when there is one argument before the splat parameter'
            splat = nil

            before each
                splat := strategies.splat strategy (
                    before: [terms.variable ['a']]
                    splat: terms.variable ['b']
                    after: []
                )

            it "doesn't require any parameters"
                should.deep equal (splat.named parameters (), [terms.variable ['a']])

            it 'generates full slice of arguments'
                generate statements from (splat).should.equal 'var b=Array.prototype.slice.call(args,1,args.length);'

        context 'when there is one argument after the splat parameter'
            splat = nil

            before each
                splat := strategies.splat strategy (
                    before: []
                    splat: terms.variable ['a']
                    after: [terms.variable ['b']]
                )

            it "doesn't require any parameters"
                should.deep equal (splat.named parameters (), [])

            it 'generates full slice of arguments'
                generate statements from (splat).should.equal 'var a=Array.prototype.slice.call(args,0,args.length-1);var b=args[args.length-1];'

        context 'when there is one argument, a splat argument, then another argument'
            splat = nil

            before each
                splat := strategies.splat strategy (
                    before: [terms.variable ['a']]
                    splat: terms.variable ['b']
                    after: [terms.variable ['c']]
                )

            it "doesn't require any parameters"
                should.deep equal (splat.named parameters (), [terms.variable ['a']])

            it 'generates full slice of arguments'
                generate statements from (splat).should.equal 'var b=Array.prototype.slice.call(args,1,args.length-1);if(args.length>1){var c=args[args.length-1];}'

    describe 'optional strategy'
        context 'when there are no other arguments'
            opts = nil

            before each
                opts := strategies.optional strategy (
                    before: []
                    options: [
                        terms.hash entry ['a'] (terms.integer 10)
                        terms.hash entry ['b'] (terms.string 'asdf')
                    ]
                )

            it 'requires only an options parameter'
                should.deep equal (opts.named parameters (), [terms.generated variable ['options']])

            it 'generates code to extract each named option from the options variable'
                generate statements from (opts).should.equal "var a,b;a=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'a')&&gen1_options.a!==void 0?gen1_options.a:10;b=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'b')&&gen1_options.b!==void 0?gen1_options.b:'asdf';"

        context 'when there are two other parameters'
            opts = nil

            before each
                opts := strategies.optional strategy (
                    before: [terms.variable ['a'], terms.variable ['b']]
                    options: [
                        terms.hash entry ['c'] (terms.integer 10)
                        terms.hash entry ['d'] (terms.string 'asdf')
                    ]
                )

            it 'requires the normal parameters and the options parameter'
                should.deep equal (opts.named parameters (), [terms.variable ['a'], terms.variable ['b'], terms.generated variable ['options']])

            it 'generates code to extract each named option from the options variable'
                generate statements from (opts).should.equal "var c,d;c=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'c')&&gen1_options.c!==void 0?gen1_options.c:10;d=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'d')&&gen1_options.d!==void 0?gen1_options.d:'asdf';"

    describe 'callback strategy'
        context "with two other parameters"
            cb = nil

            before each
                cb := strategies.callback strategy {
                    named parameters () = [terms.variable ['a'], terms.variable ['b']]

                    generate java script parameter statements (buffer, scope, args) =
                        args.generate java script (buffer, scope)
                        buffer.write ";"
                }

            it 'requires the inner parameters and the callback'
                should.deep equal (cb.named parameters (), [terms.variable ['a'], terms.variable ['b'], terms.callback function])

            it 'generates code to extract the callback and the other parameters'
                generate statements from (cb).should.equal "var gen1_arguments=Array.prototype.slice.call(args,0,args.length-1);gen2_callback=args[args.length-1];if(!(gen2_callback instanceof Function)){throw new Error('asynchronous function called synchronously');}a=gen1_arguments[0];b=gen1_arguments[1];gen1_arguments;"
