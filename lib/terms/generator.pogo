module.exports (terms) = terms.term {
    constructor (variable, list) =
        self.operator = '<-'
        self.is operator = true
        self.is generator = true
        self.variable = variable
        self.list = list
        self.operator arguments = [variable, list]
}
