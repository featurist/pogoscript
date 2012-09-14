codegen utils = require "./codegenUtils"
_ = require 'underscore'
async control = require './asyncControl'

module.exports (terms) =
    if expression term = terms.term {
        constructor (cases, _else) =
            self.is if expression = true 
            self.cases = cases
            self._else = _else

        generate java script statement (buffer, scope) =
            codegen utils.write to buffer with delimiter (self.cases, 'else ', buffer) @(case_)
                buffer.write ('if(')
                case_.0.generate java script (buffer, scope)
                buffer.write ('){')
                case_.1.generate java script statements (buffer, scope)
                buffer.write ('}')

            if (self._else)
                buffer.write ('else{')
                self._else.generate java script statements (buffer, scope)
                buffer.write ('}')

        generate java script (buffer, scope) =
            self.rewrite result term @(term) into
                terms.return statement (term)
                
            terms.function call (terms.sub expression (terms.block ([], terms.statements ([self]))), []).generate java script (buffer, scope)

        rewrite result term into (return term) =
            for each @(_case) in (self.cases)
                _case.1.rewrite result term into (return term)

            if (self._else)
                self._else.rewrite result term into (return term)

            self
    }

    if expression (cases, _else) =
        any async = _.any (cases) @(_case)
            _case.1.is async

        if (any async)
            async if function = terms.module constants.define ['async', 'if'] as (terms.javascript (async control.if.to string ()))

            terms.function call (async if function, [cases.(0).(0), terms.closure ([], cases.(0).(1))], nil, async: true)
        else
            if expression term (cases, _else)
