require './runtime.pogo'

atom prototype = object {
    arguments () = []
    block parameters () = []
    word () = null
    block () = null
}

self.atom (forms, members) =
    a = object extending (atom prototype) (members)
    a.forms = forms
    a

self.argument (forms, argument) = self.atom (forms) {
    arguments () = [argument]
}

self.block atom (forms, block) = self.atom (forms) {
    block () = block
}

self.word (forms, word) = self.atom (forms) {
    word () = word
}

self.block parameters (forms, parameters) = self.atom (forms) {
    block parameters () = parameters
}
