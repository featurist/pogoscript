codegen utils = require './codegenUtils'
_ = require 'underscore'

module.exports (terms) =
    list term = terms.term {
        constructor (items) =
            self.is list = true
            self.items = items

        generate java script (buffer, scope) =
            self.code into buffer (buffer) @(buffer)
                buffer.write ('[')
                codegen utils.write to buffer with delimiter (self.items, ',', buffer, scope)
                buffer.write (']')
    }

    list (items) =
        hash entry = _.find (items) @(item) @{item.is hash entry}
        has generator = _.find (items) @(item) @{item.is generator}

        if (hash entry)
            macro = terms.list macros.find macro (hash entry.field)

            if (macro)
                macro (list term (items), hash entry.field)
            else
                terms.errors.add term (hash entry) with message "no macro for #(hash entry.field.join ' ')"
        else if (has generator)
            terms.list comprehension (items)
        else
            list term (items)
