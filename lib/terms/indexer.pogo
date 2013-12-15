module.exports (terms) = terms.term {
    constructor (object, indexer) =
        self.object = object
        self.indexer = indexer
        self.isIndexer = true

    generate java script (buffer, scope) =
        self.code into buffer (buffer) @(buffer)
            buffer.write (self.object.generate (scope))
            buffer.write ('[')
            buffer.write (self.indexer.generate (scope))
            buffer.write (']')

    generate target (args, ...) = self.generate (args, ...)
}

