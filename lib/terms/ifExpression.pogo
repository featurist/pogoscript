codegenUtils = require "./codegenUtils"
_ = require 'underscore'
asyncControl = require '../asyncControl'

module.exports (terms) =
    ifExpressionTerm = terms.term {
        constructor (cases, elseBody) =
            self.isIfExpression = true 
            self.cases = cases
            self.elseBody = elseBody

        generateStatement (scope) =
            self.generateIntoBuffer @(buffer)
                codegenUtils.writeToBufferWithDelimiter (self.cases, 'else ', buffer) @(case_)
                    buffer.write ('if(')
                    buffer.write (case_.condition.generate (scope))
                    buffer.write ('){')
                    buffer.write (case_.body.generateStatements (scope))
                    buffer.write ('}')

                if (self.elseBody)
                    buffer.write ('else{')
                    buffer.write (self.elseBody.generateStatements (scope))
                    buffer.write ('}')

        generate (scope) =
            self.rewriteResultTerm @(term) into
                terms.returnStatement (term)

            self.code (
                '(function(){'
                self.generateStatement (scope)
                '})()'
            )

        rewriteResultTermInto (returnTerm, async: false) =
            for each @(_case) in (self.cases)
                _case.body.rewriteResultTermInto (returnTerm)

            if (self.elseBody)
                self.elseBody.rewriteResultTermInto (returnTerm)
            else if (async)
                self.elseBody = terms.statements [
                    terms.functionCall (terms.continuationFunction, [])
                ]

            self
    }

    ifExpression (cases, elseBody, isPromise: false) =
        anyAsyncCases = _.any (cases) @(_case)
            _case.body.returnsPromise @or _case.condition.containsAsync()

        if (@not isPromise @and (anyAsyncCases @or elseBody @and elseBody.returnsPromise))
          splitIfElseIf (cases, elseBody) =
            casesTail = cases.slice(1)
            if (casesTail.length > 0)
              ifExpressionTerm ([cases.0], terms.asyncStatements [splitIfElseIf(casesTail, elseBody)])
            else
              ifExpressionTerm (cases, elseBody)
            
          terms.resolve (
            splitIfElseIf(cases, elseBody)
          )
        else
            ifExpressionTerm (cases, elseBody)
