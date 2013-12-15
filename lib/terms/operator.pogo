module.exports (terms) = terms.term {
    constructor (op, args) =
        self.is operator = true
        self.operator = op
        self.operator arguments = args

    is operator alpha () = r/[a-zA-Z]+/.test (self.operator)

    generate (scope) =
        self.generate into buffer @(buffer)
            buffer.write ('(')
        
            if (self.operator arguments.length == 1)
                buffer.write (self.operator)
                if (self.is operator alpha ())
                    buffer.write (' ')

                buffer.write (self.operator arguments.0.generate (scope))
            else
                alpha = self.is operator alpha ()
          
                buffer.write (self.operator arguments.0.generate (scope))
                for (n = 1, n < self.operator arguments.length, ++n)
                    if (alpha)
                        buffer.write (' ')

                    buffer.write (self.operator)
                    if (alpha)
                        buffer.write (' ')

                    buffer.write (self.operator arguments.(n).generate (scope))
        
            buffer.write (')')
}
