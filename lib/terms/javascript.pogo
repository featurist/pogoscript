module.exports (terms) = terms.term {
    constructor (source) =
        self.is java script = true
        self.source = source

    generate java script (buffer, scope) =
      buffer.write (self.source)
}

