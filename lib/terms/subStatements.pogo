_ = require 'underscore'
codegenUtils = require('./codegenUtils')

module.exports (terms) = terms.term {
    constructor (statements) =
        self.isSubStatements = true
        self.statements = statements

    serialiseSubStatements (statements, rewrite: nil) =
        firstStatements = self.statements.slice (0, self.statements.length - 1)
        rewrittenStatements = _.map @(statement) (firstStatements)
            rewrite (statement)

        statements.push (rewrittenStatements, ...)

        lastStatement = self.statements.(self.statements.length - 1)

        if (lastStatement.isSubStatements)
            lastStatement.serialiseSubStatements (statements, rewrite: rewrite)
        else
            lastStatement

    generate () =
        self.show ()
        throw (new (Error "sub statements does not generate java script"))
}
