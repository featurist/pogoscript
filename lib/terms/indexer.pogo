module.exports (terms) = terms.term {
    constructor (object, indexer) =
        self.object = object
        self.indexer = indexer
        self.isIndexer = true

    generate (scope) =
        self.code (
            self.object.generate (scope)
            '['
            self.indexer.generate (scope)
            ']'
        )

    generate target (args, ...) = self.generate (args, ...)
}

