require './runtime.pogo'

atom prototype = object {
    arguments? = []
    block parameters? = []
    word? = null
    block? = null
}

:atom (forms, members) = 
    a = object extending (atom prototype) (members)
    a: forms = forms
    a

:argument atom (forms, argument) = :atom (forms) {
    arguments? = [argument]
}

:block atom (forms, block) = :atom (forms) {
    block? = block
}

:word atom (forms, word) = :atom (forms) {
    word? = word
}

:block parameters atom (forms, parameters) = :atom (forms) {
    block parameters? = parameters
}

:integer (forms, int) = object extending (:argument atom (forms, int)) {
    isInteger = true
}