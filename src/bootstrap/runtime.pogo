constructor (members) =
  if (members <: Function)
    c! =
      members: call (this)
      undefined
  else
    c! =
      for @(member) in (members)
        if (members: has own property (member))
          this: (member) = members: (member)

global: object (members) =
    c = constructor (members)
    new (c!)

global: object extending (base, members) =
  c = constructor (members)
  c: prototype = base
  new (c!)
