module.exports (cg) = cg.term {
    constructor (value) =
        self.is integer = true
        self.integer = value

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write (self.integer.to string ())
}
