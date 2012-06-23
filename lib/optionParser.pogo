require './class'

Option Parser = class {
    constructor () =
        self._long options = {}
        self._short options = {}
        self._options = []

    option (description) =
        match = r/(-([a-z0-9])\s*,\s*)?--([a-z0-9-]*)\s*(.*)/i.exec (description)

        if (!match)
            throw (new (Error "expected option be of the form '[-x, ]--xxxx some description of xxxx'"))

        short name = match.2
        long name = match.3
        option = {
            short name = short name
            name = long name
            description = match.4
        }

        self._long options.(long name) = option
        self._short options.(short name) = option
        self._options.push (option)

    find long option (name) =
        option = self._long options.(name)
        if (option)
            option
        else
            throw (new (Error "no such option --#(name)"))

    find short option (name) =
        option = self._short options.(name)
        if (option)
            option
        else
            throw (new (Error "no such option -#(name)"))

    set default options (options) =
        for each @(option) in (self._options)
            options.(option.name) = false

    parse (args) =
        if (!args)
            args = process.argv

        options = {
            _ = []
        }

        self.set default options (options)

        for (n = 0, n < args.length, n = n + 1)
            arg = args.(n)

            long match = r/^--([a-z0-9-]*)$/.exec (arg)
            short match = r/^-([a-z0-9-]*)$/.exec (arg)

            if (long match)
                option = self.find long option (long match.1)
                options.(option.name) = true
            else if (short match)
                for each @(short option) in (short match.1)
                    option = self.find short option (short option)
                    options.(option.name) = true
            else
                options._.push (args.slice (n), ...)
                return (options)

        options
}

exports.create parser () = new (Option Parser)
