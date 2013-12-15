module.exports (terms) = terms.term {
    constructor (pattern options) =
        self.is reg exp = true
        self.pattern = pattern options.pattern
        self.options = pattern options.options

    generate (scope) =
        options = self.options @or ''

        self.code ('/' + self.pattern.replace(r/\//g, '\/') + '/' + options)
}
