module.exports (terms) = terms.term {
    constructor (source) =
        self.is java script = true
        self.source = source

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write (self.source)
}

