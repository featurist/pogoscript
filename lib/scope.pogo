UniqueNames () = =>
    unique = 0
  
    self.generate name (name) =
        unique = unique + 1
        'gen' + unique + '_' + name

    nil

Scope = exports.Scope (parent scope, unique names) = =>
    unique names = unique names || new (UniqueNames)
  
    variables = {}
  
    self.define (name) =
        variables.(name) = true
  
    self.generate variable (name) =
        unique names.generate name (name)
  
    self.is defined (name) =
        variables.has own property (name) || (parent scope && parent scope.is defined (name))
  
    self.sub scope () =
        new (Scope (self, unique names))

    nil
