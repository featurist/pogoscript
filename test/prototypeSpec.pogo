require 'chai'.should()

describe 'prototypes'
  it 'can create a prototype'
    a = {
      base = 'base'
      overridden = 'a'
    }

    p = prototype (a)

    b = p {
      overridden = 'b'
      derived = 'derived'
    }

    b.base.should.equal 'base'
    b.overridden.should.equal 'b'
    b.derived.should.equal 'derived'
    Object.getPrototypeOf(b).should.equal(a)

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
    (objectA :: a).should.equal(true)

    objectB.a.should.equal (true)
    objectB.b.should.equal (true)
    objectB.name.should.equal 'b'
    (objectB :: a).should.equal(true)
    (objectB :: b).should.equal(true)

  it 'a prototype can be extended after creation'
    a = prototype {
      a = 'a'
    }

    a.prototype.b = 'b'

    c = a {
      c = 'c'
    }

    c.a.should.equal 'a'
    c.b.should.equal 'b'
    c.c.should.equal 'c'

  it 'prototype is a function'
    (prototype :: Function).should.equal (true)

  it 'prototypeExtending is a function'
    (prototypeExtending :: Function).should.equal (true)
