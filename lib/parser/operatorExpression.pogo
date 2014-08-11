_ = require 'underscore'
codegenUtils = require '../terms/codegenUtils'

module.exports (terms) =
    operatorStack () =
        operators = []

        {
            push (op, popped) =
                popped := popped || []

                if (operators.length == 0)
                    operators.unshift (op)
                    popped
                else if (!op.precedence || !operators.0.precedence)
                    if (!op.precedence)
                        throw (new (Error "#(op.name) cannot be used with other operators"))
                    else if (!operators.0.precedence)
                        throw (new (Error "#(operators.0.name) cannot be used with other operators"))
                else if (op.leftAssociative && (op.precedence <= operators.0.precedence))
                    popped.push (operators.shift ())
                    self.push (op, popped)
                else if (op.precedence < operators.0.precedence)
                    popped.push (operators.shift ())
                    self.push (op, popped)
                else
                    operators.unshift (op)
                    popped

            pop () = operators
        }

    operatorsInDecreasingPrecedenceOrder (opsString) =
        opLines = opsString.trim ().split r/\n/

        precedence = opLines.length + 1
        operators = {}

        for each @(line) in (opLines)
            match = r/\s*((\S+\s+)*)(left|right)/.exec (line)
            names = match.1.trim ().split r/\s+/
            assoc = match.3

            --precedence

            for each @(name) in (names)
                operators.(name) = {
                    name = name
                    leftAssociative = assoc == 'left'
                    precedence = precedence
                }

        operators

    operatorTable =
        table = operatorsInDecreasingPrecedenceOrder "
            / * % left
            - + left
            << >> >>> left
            > >= < <= left
            == != left
            & left
            ^^ left
            | left
            :: left
            && @and left
            || @or left
            <- left
        "

        {
            findOp (op) =
                if (table.hasOwnProperty (op))
                    table.(op)
                else
                    {
                        name = op
                    }
        }

    createOperatorCall (name, arguments) =
        terms.functionCall (name, arguments)

    terms.term {
        constructor (complexExpression) =
            self.arguments = [complexExpression]
            self.name = []

        addOperator (operator) expression (expression) =
            self.name.push (operator)
            self.arguments.push (expression)

        expression () =
            if (self.arguments.length > 1)
                operands = [self.arguments.0.expression ()]
                operators = operatorStack ()

                applyOperators (ops) =
                    for each @(op) in (ops)
                        right = operands.shift ()
                        left = operands.shift ()
                        name = terms.variable ([codegenUtils.normaliseOperatorName (op.name)], couldBeMacro: false)
                        operands.unshift (createOperatorCall (name, [left, right]))

                for (n = 0, n < self.name.length, ++n)
                    poppedOps = operators.push (operatorTable.findOp (self.name.(n)))
    
                    applyOperators (poppedOps)

                    operands.unshift (self.arguments.(n + 1).expression ())

                applyOperators (operators.pop ())

                return (operands.0)
            else
                self.arguments.0.expression ()

        hashEntry () =
            if (self.arguments.length == 1)
                self.arguments.0.hashEntry ()
            else
                terms.errors.addTermWithMessage (self, 'cannot be used as a hash entry')
        
        definition (source, assignment: false) =
            if (self.arguments.length > 1)
                object = self.arguments.0.expression ()
                parms = [arg.expression ().parameter (), where: arg <- self.arguments.slice (1)]
                
                terms.definition (terms.fieldReference (object, self.name), source.blockify (parms, []), assignment: assignment)
            else
                self.arguments.0.definition (source, assignment: assignment)
    }
