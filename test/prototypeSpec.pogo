require 'chai'.should()

describe 'prototypes'
  it 'can create a prototype'
    a = prototype {
      base = 'base'
      overridden = 'a'
    }

    b = a {
      overridden = 'b'
      derived = 'derived'
    }

    b.base.should.equal 'base'
    b.overridden.should.equal 'b'
    b.derived.should.equal 'derived'

  it 'properties are shared between derived objects'
    array = [1, 2, 3]

    a = prototype {
      array = array
    }

    b = a()
    c = a()

    b.array.should.equal (array)
    c.array.should.equal (array)
    b.should.not.equal (c)

  it 'prototype can extend another prototype'
    array = [1, 2, 3]

    a = prototype {
      a = true
      name = 'a'
    }

    b = prototypeExtending (a) {
      b = true
      name = 'b'
    }

    objectA = a()
    objectB = b()

    objectA.a.should.equal (true)
    objectA.name.should.equal 'a'
    objectB.a.should.equal (true)
    objectB.b.should.equal (true)
    objectB.name.should.equal 'b'

  it 'prototype is a function'
    (prototype :: Function).should.equal (true)

  it 'prototypeExtending is a function'
    (prototypeExtending :: Function).should.equal (true)
