module.exports (cg) = cg.term {
    constructor (value) =
        self.is integer = true
        self.integer = value

    generate java script (buffer, scope) =
        buffer.write (self.integer.to string ())
}
