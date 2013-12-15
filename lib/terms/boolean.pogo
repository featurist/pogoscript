module.exports (cg) = cg.term {
    constructor (value) =
        self.boolean = value
        self.is boolean = true

    generate (scope) =
        self.code (
            if (self.boolean)
                'true'
            else
                'false'
        )
}
