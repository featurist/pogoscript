module.exports (cg) = cg.term {
    constructor (value) =
        self.is float = true
        self.float = value

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write (self.float.to string())
}
