global.$class (prototype) =
  constructor (args, ...) = =>
    prototype.constructor.apply (self, args)
    nil

  constructor.prototype = prototype
  constructor

global.class extending (base constructor, prototype members) =
  prototype constructor () = =>
    for @(field) in (prototype members)
      if (prototype members.has own property (field))
        self.(field) = prototype members.(field)
  
  prototype constructor.prototype = base constructor.prototype
  prototype = new (prototype constructor ())
  constructor (args, ...) = =>
    prototype.constructor.apply (self, args)
    nil
    
  constructor.prototype = prototype
  constructor
