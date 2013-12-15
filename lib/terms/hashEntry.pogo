codegen utils = require './codegenUtils'

module.exports (terms) = terms.term {
    constructor (field, value) =
        self.is hash entry = true
        self.field = field
        self.value = value
  
    legal field name () =
      if (self.field.is string)
        return (codegen utils.format java script string (self.field.string))

      f = codegen utils.concat name (self.field)
      if (is legal java script identifier (f))
        f
      else
        codegen utils.format java script string (f)

    value or true () =
      if (self.value == undefined)
        self.cg.boolean (true)
      else
        self.value
  
    generate hash entry (scope) =
        self.code (
            self.legal field name ()
            ':'
            self.value or true ().generate (scope)
        )

    asyncify () =
        self.value.asyncify ()
}

is legal java script identifier (id) = r/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test (id)
