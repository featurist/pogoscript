module.exports (terms) = terms.term {
    constructor () =
        self.is continue = true

    generate java script statement (buffer, scope) =
      buffer.write ('continue;')

    generate java script return (args, ...) = self.generate java script statement (args, ...)
}
