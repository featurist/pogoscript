codegenUtils = require './codegenUtils'

module.exports (terms) = terms.term {
  constructor (field, value) =
    self.isHashEntry = true
    self.field = field
    self.value = value

  legalFieldName () =
    if (self.field.isString)
      return (codegenUtils.formatJavaScriptString (self.field.string))

    f = codegenUtils.concatName (self.field)
    if (isLegalJavaScriptIdentifier (f))
      f
    else
      codegenUtils.formatJavaScriptString (f)

  valueOrTrue () =
    if (self.value == undefined)
      self.cg.boolean (true)
    else
      self.value

  hashEntry() = self
  parameter() = self

  generateHashEntry (scope) =
    self.code (
      self.legalFieldName ()
      ':'
      self.valueOrTrue ().generate (scope)
    )

  asyncify () =
    self.value.asyncify ()
}

isLegalJavaScriptIdentifier (id) = r/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test (id)
