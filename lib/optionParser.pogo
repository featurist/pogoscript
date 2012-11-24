require './class'

Boolean Option = class {
    constructor (short name: nil, long name: nil, description: nil) =
        self.short name = short name
        self.name = self._camel case name (long name)
        self.long name = long name
        self.description = description

    _camel case name (long name) =
        segments = long name.split r/-/

        name = segments.0

        for (n = 1, n < segments.length, ++n)
            segment = segments.(n)
            name := name + (segment.0.to upper case () + segment.substring (1))

        name

    init (options) =
        options.(self.name) = false

    set (options) =
        options.(self.name) = true

    to string () =
        switches = [
            if (self.short name) @{ "-" + self.short name}
            if (self.long name) @{ "--" + self.long name}
        ].filter @(s)
            s
        .join ', '

        "    #(switches)\n\n        #(self.description)\n"
}

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
        option = new (Boolean Option (
            short name: short name
            long name: long name
            description: match.4
        ))

        self._add option (option)

    _add option (option) =
        self._long options.(option.long name) = option
        self._short options.(option.short name) = option
        self._options.push (option)

    _find long option (name) =
        option = self._long options.(name)
        if (option)
            option
        else
            throw (new (Error "no such option --#(name)"))

    _find short option (name) =
        option = self._short options.(name)
        if (option)
            option
        else
            throw (new (Error "no such option -#(name)"))

    _set default options (options) =
        for each @(option) in (self._options)
            option.init (options)

    parse (args) =
        if (!args)
            args := process.argv

        options = {
            _ = []
        }

        self._set default options (options)

        for (n = 0, n < args.length, ++n)
            arg = args.(n)

            long match = r/^--([a-z0-9-]*)$/.exec (arg)
            short match = r/^-([a-z0-9-]*)$/.exec (arg)

            option = nil

            if (long match)
                option := self._find long option (long match.1)
                option.set (options)
            else if (short match)
                for each @(short option) in (short match.1)
                    option := self._find short option (short option)
                    option.set (options)
            else
                options._.push (args.slice (n), ...)
                return (options)

        options

    help () =
        process.stdout.write "usage:

                                  pogo [debug] script.pogo [script options]
                                  pogo [options] scripts ...

                              options:

                              "

        for each @(option) in (self._options)
            process.stdout.write (option + "\n")
}

exports.create parser () = new (Option Parser)
