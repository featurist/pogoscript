require 'chai'.should()
cls = require '../lib/class'
class = cls.class
class extending = cls.class extending

describe 'class'
  it 'can create constructors that can be used in new'
    something = class {
      constructor (thing) =
        self.thing = thing
    }
    
    s = new (something ('thing'))
    
    s.thing.should.equal 'thing'

  it "can create constructor, even if the class doesn't define one"
    something = class {
      thing = 'thing'
    }
    
    s = new (something)
    
    s.thing.should.equal 'thing'
  
  it 'allows methods to be inherited'
    base = class {
      a method () =
        'method result'
    }
    
    derived = class extending (base) {
      constructor () = @{}
    }
    
    d = new (derived)
    
    d.a method ().should.equal 'method result'
  
  it 'a derived class can be derived again'
    base = class {
      a method () =
        'method result'
    }
    
    derived = class extending (base) {
      constructor () = nil
    }

    derived derived = class extending (derived) {
      constructor () = nil
    }
    
    d = new (derived derived)
    
    d.a method ().should.equal 'method result'
  
  it 'allows derived class to override method'
    base = class {
      a method () =
        'base result'
    }
  
    derived = class extending (base) {
      a method () =
        'derived result'
    }
  
    d = new (derived)
  
    d.a method ().should.equal 'derived result'
  
  it "allows constructors to be inherited"
    base = class {
      constructor (value) =
        self.value = value
    }
    
    derived = class extending (base) {
    }
    
    d = new (derived ('value'))
    
    d.value.should.equal 'value'
