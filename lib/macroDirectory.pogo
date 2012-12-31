_ = require 'underscore'
codegen utils = require './terms/codegenUtils'

module.exports (terms) =
    macro directory () = {
        macros = {}

        add macro (name, macro) =
            self.macros.(name) = macro

        add wild card macro (name, macro) = nil
        find macro (name) = self.macros.(name)
    }
