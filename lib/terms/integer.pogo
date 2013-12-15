module.exports (cg) = cg.term {
    constructor (value) =
        self.is integer = true
        self.integer = value

    generate (scope) =
        self.code (self.integer.to string ())
}
