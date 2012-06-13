parser = require '../src/bootstrap/parser'
parse = parser.parse

assume (term) is module with statements (action) =
    if (term.is module)
        action (term.statements)
    else
        throw (new (Error ('expected module, but found ' + term)))

assume (statements) has just one statement (action) =
    if (statements.statements.length == 1)
        action (statements.statements.0)
    else
        throw (new (Error ('expected statements to have just one statement, found ' + statements.statements.length)))

global.expression (source) =
    assume (statements (source)) has just one statement @(statement)
        statement

global.statements (source) =
    term = parse (source)
    assume (term) is module with statements @(statements)
        statements
