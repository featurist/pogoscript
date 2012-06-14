module.exports (terms) = terms.term {
    constructor (object, indexer) =
        self.object = object
        self.indexer = indexer
        self.isIndexer = true

    generate java script (buffer, scope) =
        self.object.generate java script (buffer, scope)
        buffer.write ('[')
        self.indexer.generate java script (buffer, scope)
        buffer.write (']')

    generate java script target (args, ...) = self.generate java script (args, ...)
}

