codegen utils = require "./codegenUtils"
_ = require 'underscore'
async control = require '../asyncControl'

module.exports (terms) =
    if expression term = terms.term {
        constructor (cases, else body) =
            self.is if expression = true 
            self.cases = cases
            self.else body = else body

        generate statement (scope) =
            self.generate into buffer @(buffer)
                codegen utils.write to buffer with delimiter (self.cases, 'else ', buffer) @(case_)
                    buffer.write ('if(')
                    buffer.write (case_.condition.generate (scope))
                    buffer.write ('){')
                    buffer.write (case_.body.generate statements (scope))
                    buffer.write ('}')

                if (self.else body)
                    buffer.write ('else{')
                    buffer.write (self.else body.generate statements (scope))
                    buffer.write ('}')

        generate (scope) =
            self.rewrite result term @(term) into
                terms.return statement (term)
                
            self.code (
                '(function(){'
                self.generate statement (scope)
                '})()'
            )

        rewrite result term into (return term, async: false) =
            for each @(_case) in (self.cases)
                _case.body.rewrite result term into (return term)

            if (self.else body)
                self.else body.rewrite result term into (return term)
            else if (async)
                self.else body = terms.statements [
                    terms.function call (terms.continuation function, [])
                ]

            self
    }

    ifExpression (cases, elseBody, isPromise: false) =
        any async cases = _.any (cases) @(_case)
            _case.body.returnsPromise

        if (@not isPromise @and (anyAsyncCases @or elseBody @and elseBody.returnsPromise))
          terms.resolve (
            ifExpression (cases, elseBody, isPromise: true)
          )
        else
            if expression term (cases, else body)
