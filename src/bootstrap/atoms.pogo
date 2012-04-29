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

:argument (forms, argument) = :atom (forms) {
    arguments? = [argument]
}

:block atom (forms, block) = :atom (forms) {
    block? = block
}

:word (forms, word) = :atom (forms) {
    word? = word
}

:block parameters (forms, parameters) = :atom (forms) {
    block parameters? = parameters
}
