codegenUtils = require './codegenUtils'
_ = require 'underscore'

module.exports (terms) =
    listTerm = terms.term {
        constructor (items) =
            self.isList = true
            self.items = items

        generate (scope) =
            self.generateIntoBuffer @(buffer)
                splatArguments = terms.splatArguments (self.items)

                if (splatArguments)
                    buffer.write (splatArguments.generate (scope))
                else
                    buffer.write ('[')
                    codegenUtils.writeToBufferWithDelimiter (self.items, ',', buffer, scope)
                    buffer.write (']')
    }

    insertSplatsAfterRanges (items) =
        itemsWithSplats = []

        for (n = 0, n < items.length, ++n)
            item = items.(n)
            itemsWithSplats.push(item)
            if (item.isRange)
                item.inList = true
                itemsWithSplats.push(terms.splat())

        itemsWithSplats

    list (listItems) =
        items = insertSplatsAfterRanges (listItems)
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
