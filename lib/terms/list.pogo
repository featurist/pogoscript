codegenUtils = require './codegenUtils'
_ = require 'underscore'

module.exports (terms) =
    listTerm = terms.term {
        constructor (items) =
            self.isList = true
            self.items = items

        generateJavaScript (buffer, scope) =
            splatArguments = terms.splatArguments (self.items)

            if (splatArguments)
                splatArguments.generateJavaScript (buffer, scope)
            else
                buffer.write ('[')
                codegenUtils.writeToBufferWithDelimiter (self.items, ',', buffer, scope)
                buffer.write (']')
    }

    list (items) =
        hashEntry = _.find (items) @(item) @{item.isHashEntry}
        hasGenerator = _.find (items) @(item) @{item.isGenerator}

        if (hashEntry)
            macro = terms.listMacros.findMacro (hashEntry.field)

            if (macro)
                macro (listTerm (items), hashEntry.field)
            else
                terms.errors.addTerm (hashEntry) withMessage "no macro for #(hashEntry.field.join ' ')"
        else if (hasGenerator)
            terms.listComprehension (items)
        else
            listTerm (items)
