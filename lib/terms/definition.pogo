module.exports (terms) = terms.term {
  constructor (target, source, async: false, shadow: false, assignment: false) =
    self.isDefinition = true
    self.target = target
    self.source = source
    self.isAsync = async
    self.shadow = shadow
    self.global = false
    self.isAssignment = assignment

  expression () =
    self

  parameter () =
    self

  hashEntry () =
    self.cg.hashEntry (self.target.hashEntryField (), self.source)

  generate (scope) =
    self.code (
      self.target.generateTarget (scope)
      '='
      self.source.generate (scope)
    )

  defineVariables (scope) =
    name = self.target.canonicalName (scope)

    if (name)
      if (@not self.isAssignment)
        if (scope.is (name) defined @and @not self.shadow)
          terms.errors.addTerm (self) withMessage "variable #(self.target.displayName ()) is already defined, use := to reassign it"
        else if (@not self.global)
          self.target.declare (scope)
      else if (@not scope.is (name) defined)
        terms.errors.addTerm (self) withMessage "variable #(self.target.displayName ()) is not defined, use = to define it"

  makeAsyncWithCallbackForResult (createCallbackForResult) =
    if (self.isAsync)
      callback = createCallbackForResult (self.target)
      self.source.makeAsyncCallWithCallback (callback)
}
