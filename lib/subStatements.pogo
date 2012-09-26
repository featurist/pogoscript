_ = require 'underscore'
codegen utils = require('./codegenUtils')

module.exports (terms) = terms.term {
    constructor (statements) =
        self.is sub statements = true
        self.statements = statements

    serialise sub statements (statements, rewrite: nil) =
        first statements = self.statements.slice (0, self.statements.length - 1)
        rewritten statements = _.map @(statement) (first statements)
            rewrite (statement)

        statements.push (rewritten statements, ...)

        self.statements.(self.statements.length - 1)

    generate java script () =
        self.show ()
        throw (new (Error "sub statements does not generate java script"))
}
