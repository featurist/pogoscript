module.exports (cg) = cg.term {
    constructor (value) =
        self.boolean = value
        self.is boolean = true

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            if (self.boolean)
                buffer.write 'true'
            else
                buffer.write 'false'
}
