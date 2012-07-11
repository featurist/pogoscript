_ = require 'underscore'
codegen utils = require('./codegenUtils')

module.exports (terms) = terms.term {
    constructor (statements) =
        self.is sub statements = true
        self.statements = statements

    serialise sub statements (statements) =
        first statements = self.statements.slice (0, self.statements.length - 1)
        statements.push (first statements, ...)

        self.statements.(self.statements.length - 1)
}
