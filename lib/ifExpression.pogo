codegen utils = require "./codegenUtils"

module.exports (terms) = terms.term {
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
