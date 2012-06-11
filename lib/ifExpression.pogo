codegen utils = require "./codegenUtils"
terms = require './terms'

module.exports = terms.term {
    constructor (cases, _else) =
        self.is if expression = true 
        self.cases = cases
        self._else = _else

    generate java script statement (buffer, scope, generate return statements) =
        codegen utils.write to buffer with delimiter (self.cases, 'else ', buffer) @(case_)
            buffer.write ('if(')
            case_.0.generate java script (buffer, scope)
            buffer.write ('){')
            if (generate return statements)
                case_.1.generate java script statements return (buffer, scope)
            else
                case_.1.generate java script statements (buffer, scope)

            buffer.write ('}')

        if (self._else)
            buffer.write ('else{')

            if (generate return statements)
                self._else.generate java script statements return (buffer, scope)
            else
                self._else.generate java script statements (buffer, scope)

            buffer.write ('}')

    generate java script (buffer, scope) =
        self.cg.function call (self.cg.sub expression (self.cg.block ([], self.cg.statements ([self]))), []).generate java script (buffer, scope)

    generate java script return (buffer, scope) =
        self.generate java script statement (buffer, scope, true)
}
