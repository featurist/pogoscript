module.exports (cg) = cg.term {
    constructor (value) =
        self.is float = true
        self.float = value

    generate (scope) =
        self.code (self.float.to string())
}
