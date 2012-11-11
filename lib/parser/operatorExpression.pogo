_ = require 'underscore'

module.exports (terms) =
    operator stack () =
        operators = []

        {
            push (op, popped) =
                popped = popped || []

                if (operators.length == 0)
                    operators.unshift (op)
                    popped
                else if (!op.precedence || !operators.0.precedence)
                    if (!op.precedence)
                        throw (new (Error "#(op.name) cannot be used with other operators"))
                    else if (!operators.0.precedence)
                        throw (new (Error "#(operators.0.name) cannot be used with other operators"))
                else if (op.left associative && (op.precedence <= operators.0.precedence))
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

    operators in decreasing precedence order (ops string) =
        op lines = ops string.trim ().split r/\n/

        precedence = op lines.length + 1
        operators = {}

        for each @(line) in (op lines)
            match = r/\s*(\S+)\s+(left|right)/.exec (line)
            name = match.1
            assoc = match.2

            precedence = precedence - 1

            operators.(name) = {
                name = name
                left associative = assoc == 'left'
                precedence = precedence
            }

        operators

    operator table =
        table = operators in decreasing precedence order "
            / left
            * left
            % left
            - left
            + left
            @or  right
            @and right
        "

        {
            find op (op) =
                if (table.has own property (op))
                    table.(op)
                else
                    {
                        name = op
                    }
        }

    normalise operator name (name) =
        match = r/^@([a-z_$]+)$/i.exec (name)
        if (match)
            match.1
        else
            name

    create operator call (name, arguments) =
        terms.function call (name, arguments)

    terms.term {
        constructor (complex expression) =
            self.arguments = [complex expression]
            self.name = []

        add operator (operator) expression (expression) =
            self.name.push (operator)
            self.arguments.push (expression)

        expression () =
            if (self.arguments.length > 1)
                operands = [self.arguments.0.expression ()]
                operators = operator stack ()

                apply operators (ops) =
                    for each @(op) in (ops)
                        right = operands.shift ()
                        left = operands.shift ()
                        name = terms.variable ([normalise operator name (op.name)], could be macro: false)
                        operands.unshift (create operator call (name, [left, right]))

                for (n = 0, n < self.name.length, n = n + 1)
                    op = operator table.find op (self.name.(n))
                    popped ops = operators.push (op)
    
                    apply operators (popped ops)

                    operands.unshift (self.arguments.(n + 1).expression ())

                popped ops = operators.pop ()
                apply operators (popped ops)

                return (operands.0)
            else
                this.arguments.0.expression ()

        hash entry () =
            if (this.arguments.length == 1)
                this.arguments.0.hash entry ()
            else
                terms.errors.add term with message (self, 'cannot be used as a hash entry')
        
        definition (source) =
            if (this.arguments.length > 1)
                object = self.arguments.0.expression ()
                parms = _(self.arguments.slice (1)).map @(arg)
                    arg.expression ().parameter ()
                
                terms.definition (terms.field reference (object, self.name), source.blockify (parms, []))
            else
                this.arguments.0.definition (source)
    }
