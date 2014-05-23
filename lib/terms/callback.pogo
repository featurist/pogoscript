module.exports (terms) = terms.term {
    constructor () =
        self.isCallback = true
    
    parameter () =
        self

    generate (scope) =
      terms.onFulfilledFunction.generate (scope)
}
