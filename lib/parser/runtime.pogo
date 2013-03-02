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

exports.object (members) =
    c = constructor (members)
    new (c ())

exports.object extending (base, members) =
  c = constructor (members)
  c.prototype = base
  new (c ())
