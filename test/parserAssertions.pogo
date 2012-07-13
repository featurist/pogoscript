parser = require '../src/bootstrap/parser'
parse = parser.parse

assume (term) is module with statements (action) =
    if (term.is module)
        action (term.statements)
    else
        throw (new (Error ('expected module, but found ' + term.inspect term ())))

assume (statements) has just one statement (action) =
    if (statements.statements.length == 1)
        action (statements.statements.0)
    else
        throw (new (Error ('expected statements to have just one statement, found ' + statements.statements.length)))

global.expression (source) =
    assume (statements (source)) has just one statement @(statement)
        statement

global.macro expression (source) =
    assume (statements (source, expand macros: true)) has just one statement @(statement)
        statement

global.macro statements (source, print: false) =
    stmts = statements (source, expand macros: true)
    if (print)
        stmts.show ()

    stmts

global.statements (source, expand macros: false) =
    term = parse (source)
    term.in scope = false

    if (expand macros)
        term.expand macros ().statements
    else
        term.statements
