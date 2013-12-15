async control = require '../asyncControl'

module.exports (terms) =
    try expression term = terms.term {
        constructor (body, catch body: nil, catch parameter: nil, finally body: nil) =
            self.is try expression = true
            self.body = body
            self.catch body = catch body
            self.catch parameter = catch parameter
            self.finally body = finally body

        generate java script statement (buffer, scope, return statements) =
            self.code into buffer (buffer) @(buffer)
                buffer.write ('try{')
                if (return statements)
                    buffer.write (self.body.generate statements return (scope))
                else
                    buffer.write (self.body.generate statements (scope))

                buffer.write ('}')
                if (self.catch body)
                    buffer.write ('catch(')
                    buffer.write (self.catch parameter.generate (scope))
                    buffer.write ('){')
                    if (return statements)
                        buffer.write (self.catch body.generate statements return (scope))
                    else
                        buffer.write (self.catch body.generate statements (scope))

                    buffer.write ('}')

                if (self.finally body)
                    buffer.write ('finally{')
                    buffer.write (self.finally body.generate statements (scope))
                    buffer.write ('}')
        
        generate java script (buffer, symbol scope) =
            self.code into buffer (buffer) @(buffer)
                if (self.already called)
                    throw (new (Error 'stuff'))

                self.already called = true
                buffer.write (self.cg.scope ([self], always generate function: true).generate (symbol scope))

        rewrite result term into (return term) =
            self.body.rewrite result term into (return term)

            if (self.catch body)
                self.catch body.rewrite result term into (return term)

            self
    }

    try expression (body, catch body: nil, catch parameter: nil, finally body: nil) =
        if ((body.is async || (catch body && catch body.is async)) || (finally body && finally body.is async))
            async try function =
                terms.module constants.define ['async', 'try'] as (terms.javascript (async control.try.to string ()))

            terms.function call (
                async try function
                [
                    terms.argument utils.asyncify body (body)
                    terms.argument utils.asyncify body (catch body, [catch parameter])
                    terms.argument utils.asyncify body (finally body)
                ]
                async: true
            )
        else
            try expression term (body, catch body: catch body, catch parameter: catch parameter, finally body: finally body)
