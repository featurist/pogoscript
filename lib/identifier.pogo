module.exports (cg) =
    identifier = class extending (cg.term class) {
        constructor (name) =
            self.is identifier = true
            self.identifier = name

        arguments () = nil
    }

    @(args, ...)
        new (identifier (args, ...))
