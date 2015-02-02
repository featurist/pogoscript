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

  it 'prototype object defaults to empty object, if not given'
    a = prototype()

    a.prototype.a = 'a'

    b = a()

    b.a.should.equal 'a'

  it 'prototype can extend another constructor'
    a = prototypeExtending (Array) {
      a = 'a'
    }

    b = a {
      b = 'b'
    }
    b.push 'item'

    (b :: a).should.equal(true)
    (b :: Array).should.equal(true)
    b.a.should.equal 'a'
    b.b.should.equal 'b'
    b.length.should.equal 1
    b.0.should.equal 'item'

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

  it 'can call its own constructor'
    a = prototype {
      create(value) = self.constructor {
        value = value
      }

      isA = true
    }

    b = prototypeExtending (a) {
      isB = true
    }

    x = a()
    x.isA.should.be.true
    createdByA = x.create('a')
    createdByA.value.should.equal 'a'
    createdByA.isA.should.be.true

    y = b()
    y.isA.should.be.true
    y.isB.should.be.true
    createdByB = y.create('b')
    createdByB.value.should.equal 'b'
    createdByB.isA.should.be.true
    createdByB.isB.should.be.true
