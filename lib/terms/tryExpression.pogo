async control = require '../asyncControl'

module.exports (terms) =
    try expression term = terms.term {
        constructor (body, catch body: nil, catch parameter: nil, finally body: nil) =
            self.is try expression = true
            self.body = body
            self.catch body = catch body
            self.catch parameter = catch parameter
            self.finally body = finally body

        generate statement (scope, return statements) =
            self.generate into buffer @(buffer)
                buffer.write ('try{')
                buffer.write (self.body.generate statements (scope))

                buffer.write ('}')
                if (self.catch body)
                    buffer.write ('catch(')
                    buffer.write (self.catch parameter.generate (scope))
                    buffer.write ('){')
                    buffer.write (self.catch body.generate statements (scope))

                    buffer.write ('}')

                if (self.finally body)
                    buffer.write ('finally{')
                    buffer.write (self.finally body.generate statements (scope))
                    buffer.write ('}')
        
        generate (symbol scope) =
            self.generate into buffer @(buffer)
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
        if ((body.returnsPromise || (catch body && catch body.returnsPromise)) || (finally body && finally body.returnsPromise))
          if (catchBody)
            if (finallyBody)
              terms.resolve (body)
            else
              terms.resolve (terms.methodCall (body.promisify(), ['then'], [terms.nil(), terms.closure ([catchParameter], catchBody)]), alreadyPromise: true)
          else if (finallyBody)
            result = terms.generatedVariable ['result']
            terms.resolve (
              terms.methodCall (
                body.promisify()
                ['then']
                [
                  terms.closure (
                    [result]
                    terms.statements [
                      terms.methodCall (
                        finallyBody.promisify()
                        ['then']
                        [
                          terms.closure ([], terms.statements [result])
                        ]
                      )
                    ]
                  )
                ]
              )
              alreadyPromise: true
            )
          else
            terms.resolve (body)
        else
            try expression term (body, catch body: catch body, catch parameter: catch parameter, finally body: finally body)
