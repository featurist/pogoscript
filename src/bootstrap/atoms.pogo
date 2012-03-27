require './runtime.pogo'

atom prototype = object {
    arguments? = []
    block parameters? = []
    word? = null
    block? = null
}

exports: atom (members) = object extending (atom prototype) (members)

exports: argument atom (argument) = atom {
    arguments? = [argument]
}

exports: block atom (block) = atom {
    block? = block
}

exports: word atom (word) = atom {
    word? = word
}

exports: block parameters atom (parameters) = atom {
    block parameters? = parameters
}
