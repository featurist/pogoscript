module.exports (terms) = terms.term {
    constructor (error terms, message) =
        self.is semantic error = true
        self.error terms = error terms
        self.message = message

    generate java script () = nil

    print error (source file, buffer) =
        source file.print location (self.error terms.0.location (), buffer)
        buffer.write(this.message + "\n")

    generate java script hash entry () = nil
}
