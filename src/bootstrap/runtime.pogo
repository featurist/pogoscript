constructor (members) =
  if (members :: Function)
    =>
      members.call (self)
      undefined
  else
    =>
      for @(member) in (members)
        if (members.has own property (member))
          self.(member) = members.(member)

global.object (members) =
    c = constructor (members)
    new (c ())

global.object extending (base, members) =
  c = constructor (members)
  c.prototype = base
  new (c ())
