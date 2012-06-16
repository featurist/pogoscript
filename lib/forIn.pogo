module.exports (terms) = terms.term {
    constructor (iterator, collection, stmts) =
        self.is for in = true
        self.iterator = iterator
        self.collection = collection
        self.statements = stmts
  
    generate java script (buffer, scope) =
        buffer.write('for(var ')
        self.iterator.generate java script(buffer, scope)
        buffer.write(' in ')
        self.collection.generate java script(buffer, scope)
        buffer.write('){')

        self.cg.sub expression(
            self.cg.function call(
                self.cg.block(
                    [self.iterator]
                    self.statements
                    return last statement: false
                )
                [self.iterator]
            )
        ).generate java script statement(buffer, scope)

        buffer.write('}')

    generate java script statement (args, ...) = self.generate java script (args, ...)
    generate java script return (args, ...) = self.generate java script (args, ...)
  
    definitions (scope) =
      defs = []
      index name = self.iterator.definition name(scope)
      if (indexName)
        defs.push(indexName)

      defs.concat(self.statements.definitions(scope))
}
