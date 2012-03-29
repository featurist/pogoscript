require './runtime.pogo'

atom prototype = object {
    arguments? = []
    block parameters? = []
    word? = null
    block? = null
}

:atom (members) = object extending (atom prototype) (members)

:argument atom (argument) = atom {
    arguments? = [argument]
}

:block atom (block) = atom {
    block? = block
}

:word atom (word) = atom {
    word? = word
}

:block parameters atom (parameters) = atom {
    block parameters? = parameters
}
