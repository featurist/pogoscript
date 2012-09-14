codegen utils = require "./codegenUtils"
_ = require 'underscore'
async control = require './asyncControl'

module.exports (terms) =
    if expression term = terms.term {
        constructor (cases, else body) =
            self.is if expression = true 
            self.cases = cases
            self.else body = else body

        generate java script statement (buffer, scope) =
            codegen utils.write to buffer with delimiter (self.cases, 'else ', buffer) @(case_)
                buffer.write ('if(')
                case_.condition.generate java script (buffer, scope)
                buffer.write ('){')
                case_.body.generate java script statements (buffer, scope)
                buffer.write ('}')

            if (self.else body)
                buffer.write ('else{')
                self.else body.generate java script statements (buffer, scope)
                buffer.write ('}')

        generate java script (buffer, scope) =
            self.rewrite result term @(term) into
                terms.return statement (term)
                
            terms.function call (terms.sub expression (terms.block ([], terms.statements ([self]))), []).generate java script (buffer, scope)

        rewrite result term into (return term) =
            for each @(_case) in (self.cases)
                _case.body.rewrite result term into (return term)

            if (self.else body)
                self.else body.rewrite result term into (return term)

            self
    }

    if expression (cases, else body) =
        any async cases = _.any (cases) @(_case)
            _case.body.is async

        if (any async cases || (else body && else body.is async))
            async closure for (body) =
                closure = terms.closure ([], body)
                closure.asyncify ()
                closure

            if (cases.length > 1)
                case for condition (condition) and body (body) =
                    terms.hash [
                        terms.hash entry (
                            ['condition']
                            condition
                        )
                        terms.hash entry (
                            ['body']
                            async closure for (body)
                        )
                    ]

                cases list =
                    _.map (cases) @(_case)
                        case for condition (_case.condition) and body (_case.body)

                if (else body)
                    cases list.push (
                        case for condition (terms.boolean (true)) and body (else body)
                    )

                async if else if else function =
                    terms.module constants.define ['async', 'if', 'else', 'if', 'else'] as (
                        terms.javascript (async control.if else if else.to string ())
                    )

                terms.function call (async if else if else function, [terms.list (cases list)], async: true)
            else if (else body)
                async if else function =
                    terms.module constants.define ['async', 'if', 'else'] as (
                        terms.javascript (async control.if else.to string ())
                    )

                terms.function call (
                    async if else function
                    [
                        cases.0.condition
                        async closure for (cases.0.body)
                        async closure for (else body)
                    ]
                    async: true
                )
            else
                async if function =
                    terms.module constants.define ['async', 'if'] as (
                        terms.javascript (async control.if.to string ())
                    )

                terms.function call (
                    async if function
                    [
                        cases.0.condition
                        async closure for (cases.0.body)
                    ]
                    async: true
                )
        else
            if expression term (cases, else body)
