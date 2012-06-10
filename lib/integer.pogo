module.exports (cg) =
    integer = class extending (cg.term class) {
        constructor (value) =
            self.is integer = true
            self.integer = value

        generate java script (buffer, scope) =
            buffer.write (self.integer.to string ())
    }

    @(args, ...)
        new (integer (args, ...))
