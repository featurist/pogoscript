module.exports (cg) = cg.term {
    constructor (value) =
        self.is float = true
        self.float = value

    generate java script (buffer, scope) =
      buffer.write (self.float.to string())
}
