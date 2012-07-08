_ = require 'underscore'
codegen utils = require('./codegenUtils')

module.exports (terms) = terms.term {
    constructor (statements, expression: false) =
        self.is statements = true
        self.statements = statements
        self.is expression statements = expression

    generate statements (statements, buffer, scope, global, generate return) =
        serialised statements = self.serialise statements (statements)
        declared variables = self.find declared variables (scope)

        self.generate variable declarations (declared variables, buffer, scope, global)

        for (s = 0, s < serialised statements.length, s = s + 1)
            statement = serialised statements.(s)
            if ((s == (serialised statements.length - 1)) && generate return)
                statement.generate java script return (buffer, scope)
            else
                statement.generate java script statement (buffer, scope)

    rewrite async callbacks (statements) =
        statements = self.serialise statements (self.statements)

        for (n = 0, n < statements.length, n = n + 1)
            statement = statements.(n)
            async statement = statement.make async with statements
                statements.slice (n + 1)

            if (async statement)
                first statements = statements.slice (0, n)
                first statements.push (async statement)
                return (terms.statements (first statements))

        self

    generate variable declarations (variables, buffer, scope, global) =
        if (variables.length > 0)
            _(variables).each @(name)
                scope.define (name)

            if (!global)
                buffer.write ('var ')

                codegen utils.write to buffer with delimiter (variables, ',', buffer) @(variable)
                    buffer.write (variable)

                buffer.write (';')
        

    find declared variables (scope) =
        declared variables = []

        self.walk descendants @(subterm)
            subterm.declare variables (declared variables, scope)
        not below @(subterm, path) if
            subterm.is statements && path.(path.length - 1).is closure

        _.uniq (declared variables)

    serialise statements (statements) =
        serialised statements = []

        for each @(statement) in (statements)
            serialised statements.push (statement.clone (
                rewrite (term):
                    term.serialise sub statements (serialised statements)
                    
                limit (term):
                    term.is statements && !term.is expression statements
            ))

        serialised statements
    
    serialise sub statements (statements) =
        if (self.is expression statements)
            first statements = self.statements.slice (0, self.statements.length - 1)
            statements.push (first statements, ...)

            self.statements.(self.statements.length - 1)

    generate java script statements (buffer, scope, global) =
        self.generate statements (self.statements, buffer, scope, global)

    blockify (parameters, optionalParameters) =
        statements = if (self.is expression statements)
            self.cg.statements ([self])
        else
            self

        b = self.cg.block (parameters, statements)
        b.optional parameters = optional parameters
        b

    scopify () =
        self.cg.function call (self.cg.block([], self), [])

    generate java script statements return (buffer, scope, global) =
        if (self.statements.length > 0)
            self.generate statements (self.statements, buffer, scope, global, true)

    generate java script (buffer, scope) =
        if (self.statements.length > 0)
            self.statements.(self.statements.length - 1).generate java script (buffer, scope)

    generate java script statement (buffer, scope) =
        if (self.statements.length > 0)
            self.statements.(self.statements.length - 1).generate java script statement (buffer, scope)

    generate java script return (buffer, scope) =
        if (self.statements.length > 0)
            self.statements.(self.statements.length - 1).generate java script return (buffer, scope)

    definitions (scope) =
        _(self.statements).reduce @(list, statement)
            defs = statement.definitions(scope)
            list.concat (defs)
        []
}
