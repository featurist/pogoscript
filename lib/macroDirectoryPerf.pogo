_ = require 'underscore'
codegen utils = require './terms/codegenUtils'

module.exports (terms) =
    regex to match strings in (macro array) =
        @new RegExp "^(#(["(#(regex for (macro)))", where: macro <- macro array].join '|'))$"

    regex for (macro) =
        s = macro.name
        for each @(c) in ("$".split '')
            s := s.replace (c) "\\#(c)"

        if (macro.wild)
            s + '.*'
        else
            s

    macro directory () = {
        macros = []
        macro names = {}
        regex = nil

        add macro (name, macro, wild: false) =
            if (Object.has own property.call (self.macro names, name))
                self.macros.(self.macro names.(name)).macro = macro
            else
                self.macros.push {name = name, macro = macro, wild = wild}
                self.macro names.(name) = self.macros.length - 1
                self.regex = regex to match strings in (self.macros)

        add wild card macro (name, macro) = self.add macro (name, macro, wild: true)

        find macro (name) =
            debugger
            match = self.regex.exec (name)
            if (match)
                console.log (name)
                console.log (match)
                i = _.index of (match.slice 2, name)
                macro = self.macros.(i)
                if (macro.wild)
                    macro.macro (name) @or self.find macro (name)

                else
                    macro.macro
    }
