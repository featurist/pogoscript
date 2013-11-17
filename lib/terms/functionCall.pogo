codegen utils = require './codegenUtils'
argument utils = require './argumentUtils'
_ = require 'underscore'
async control = require '../asyncControl'

module.exports (terms) =
    function call term = terms.term {
        constructor (
            fun
            args
            optional arguments: []
            async: false
            pass this to apply: false
            originally async: false
            async callback argument: nil
        ) =
            self.is function call = true

            self.function = fun
            self.function arguments = args
            self.optional arguments = optional arguments
            self.pass this to apply = pass this to apply
            self.is async = async
            self.originally async = originally async
            self.async callback argument = async callback argument

        has splat arguments () =
            _.any (self.function arguments) @(arg)
                arg.is splat
      
        generate java script (buffer, scope) =
            self.function.generate java script (buffer, scope)

            args = codegen utils.concat args (
                self.function arguments
                optional args: self.optional arguments
                async callback arg: self.async callback argument
                terms: terms
            )

            splatted arguments = self.cg.splat arguments (args)
        
            if (splatted arguments && self.function.is indexer)
                buffer.write ('.apply(')
                self.function.object.generate java script (buffer, scope)
                buffer.write (',')
                splatted arguments.generate java script (buffer, scope)
                buffer.write (')')
            else if (splatted arguments)
                buffer.write ('.apply(')

                if (self.pass this to apply)
                    buffer.write ('this')
                else
                    buffer.write ('null')

                buffer.write (',')
                splatted arguments.generate java script (buffer, scope)
                buffer.write (')')
            else
                buffer.write ('(')
                codegen utils.write to buffer with delimiter (args, ',', buffer, scope)
                buffer.write (')')

        make async call with callback (callback) =
            self.async callback argument = callback
            terms.return statement (self, implicit: true)
    }

    function call (
        fun
        args
        optional arguments: []
        async: false
        pass this to apply: false
        originally async: false
        async callback argument: nil
        could be macro: true
        future: false
    ) =
        if (async)
            async result = terms.async result ()

            terms.argument utils.asyncify arguments (args, optional arguments)

            return (
                terms.sub statements [
                    terms.definition (
                        async result
                        function call term (
                            fun
                            args
                            optional arguments: optional arguments
                            pass this to apply: pass this to apply
                            originally async: true
                            async callback argument: async callback argument
                        )
                        async: true
                    )
                    async result
                ]
            )
        else if (future)
            future function =
                terms.module constants.define ['future'] as (
                    terms.javascript (async control.future.to string ())
                )

            return (
                terms.function call (
                    future function
                    [
                        terms.closure (
                            [terms.callback function]
                            terms.statements [
                                terms.function call (
                                    fun
                                    args
                                    optional arguments: optional arguments
                                    pass this to apply: pass this to apply
                                    originally async: true
                                    async callback argument: terms.callback function
                                    could be macro: could be macro
                                )
                            ]
                        )
                    ]
                )
            )
        else if (fun.variable @and could be macro)
            name = fun.variable
            macro = terms.macros.find macro (name)
            fun call = function call term (fun, args, optional arguments: optional arguments)
        
            if (macro)
                return (macro (fun call, name, args, optional arguments))

        function call term (
            fun
            args
            optional arguments: optional arguments
            pass this to apply: pass this to apply
            originally async: originally async
            async callback argument: async callback argument
        )
