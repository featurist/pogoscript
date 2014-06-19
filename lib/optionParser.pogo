class = require './class'.class

BooleanOption = class {
    constructor (shortName: nil, longName: nil, description: nil) =
        self.shortName = shortName
        self.name = camelCaseName (longName)
        self.longName = longName
        self.description = description

    init (options) =
        options.(self.name) = false

    set (options) =
        options.(self.name) = true

    toString () =
        switches = [
            if (self.shortName) @{ "-" + self.shortName}
            if (self.longName) @{ "--" + self.longName}
        ].filter @(s)
            s
        .join ', '

        "    #(switches)\n\n        #(self.description)\n"
}

StringOption = class {
    constructor (shortName: nil, longName: nil, description: nil) =
        self.shortName = shortName
        self.name = camelCaseName (longName)
        self.longName = longName
        self.description = description

    init (options) =
        options.(self.name) = nil

    set (options, arguments) =
        options.(self.name) = arguments.shift()

    toString () =
        switches = [
            if (self.shortName) @{ "-" + self.shortName}
            if (self.longName) @{ "--" + self.longName}
        ].filter @(s)
            s
        .join ', '

        "    #(switches)\n\n        #(self.description)\n"
}

camelCaseName (longName) =
    segments = longName.split r/-/

    name = segments.0

    for (n = 1, n < segments.length, ++n)
        segment = segments.(n)
        name := name + (segment.0.toUpperCase () + segment.substring (1))

    name

parsers = [
  string (description) =
    match = r/(-([a-z0-9])\s*,\s*)?--([a-z0-9-]+)=<[a-z0-9-]+>\s*(.*)/i.exec (description)

    if (match)
      shortName = match.2
      longName = match.3
      new (StringOption (
          shortName: shortName
          longName: longName
          description: match.4
      ))

  boolean (description) =
    match = r/(-([a-z0-9])\s*,\s*)?--([a-z0-9-]*)\s*(.*)/i.exec (description)

    if (match)
      shortName = match.2
      longName = match.3
      new (BooleanOption (
          shortName: shortName
          longName: longName
          description: match.4
      ))
]

OptionParser = class {
    constructor () =
        self._longOptions = {}
        self._shortOptions = {}
        self._options = []

    option (description) =
        option = [parser <- parsers, option = parser (description), option, option].0

        if (option)
          self._addOption(option)
        else
          throw (new (Error "expected option be of the form '[-x, ]--xxxx[=<value>] some description of xxxx'"))

    _addOption (option) =
        self._longOptions.(option.longName) = option
        self._shortOptions.(option.shortName) = option
        self._options.push (option)

    _findLongOption (name) =
        option = self._longOptions.(name)
        if (option)
            option
        else
            throw (new (Error "no such option --#(name)"))

    _findShortOption (name) =
        option = self._shortOptions.(name)
        if (option)
            option
        else
            throw (new (Error "no such option -#(name)"))

    _setDefaultOptions (options) =
        for each @(option) in (self._options)
            option.init (options)

    parse (args) =
        if (!args)
            args := process.argv

        options = {
            _ = []
        }

        self._setDefaultOptions (options)

        remainingArguments = args.slice()
        while (remainingArguments.length > 0)
            arg = remainingArguments.shift()

            longMatch = r/^--([a-z0-9-]*)$/.exec (arg)
            shortMatch = r/^-([a-z0-9-]*)$/.exec (arg)

            option = nil

            if (longMatch)
                option := self._findLongOption (longMatch.1)
                option.set (options, remainingArguments)
            else if (shortMatch)
                for each @(shortOption) in (shortMatch.1)
                    option := self._findShortOption (shortOption)
                    option.set (options, remainingArguments)
            else
                options._.push (arg, remainingArguments.slice (), ...)
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

exports.createParser () = new (OptionParser)
