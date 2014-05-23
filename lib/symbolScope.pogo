UniqueNames () = =>
  unique = 0

  self.generateName (name) =
    unique := unique + 1
    'gen' + unique + '_' + name

  nil

SymbolScope = exports.SymbolScope (parentScope, uniqueNames: @new UniqueNames) = =>
  variables = {}
  tags = {}

  self.define (name) =
    variables.(name) = true

  self.generateVariable (name) =
    uniqueNames.generateName (name)

  self.isDefined (name) =
    self.is (name) definedInThisScope || (parentScope && parentScope.is (name) defined)

  self.is (name) definedInThisScope =
    variables.hasOwnProperty (name)

  self.subScope () =
    @new SymbolScope (self, uniqueNames: uniqueNames)

  self.define (name) withTag (tag) =
    self.define (name)
    tags.(tag) = name

  self.findTag (tag) =
    tags.(tag) @or parentScope @and parentScope.findTag (tag)

  self.names () =
    [key <- Object.keys (variables), variables.hasOwnProperty (key), key]

  nil
