module.exports (terms) = terms.term {
    constructor (pattern options) =
        self.is reg exp = true
        self.pattern = pattern options.pattern
        self.options = pattern options.options

    generate java script (buffer, scope) =
        options = if (self.options)
            '/' + self.options
        else
            '/'

        buffer.write ('/' + this.pattern.replace(r/\//g, '\/') + options)
}
