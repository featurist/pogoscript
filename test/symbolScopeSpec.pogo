SymbolScope = require '../lib/symbolScope'.SymbolScope
require 'chai'.should()

describe 'symbolScope'
  context 'when scope A has sub scope B'
    a = nil
    b = nil

    beforeEach
      a := @new SymbolScope()
      b := a.subScope()

    context 'definition of X in A'
      beforeEach
        a.define 'x'

      it 'exists in scope A'
        a.is 'x' defined.should.be.true

      it 'exists in scope B'
        b.is 'x' defined.should.be.true

      it 'defined in scope A'
        a.is 'x' definedInThisScope.should.be.true

      it 'not defined in scope B'
        b.is 'x' definedInThisScope.should.be.false

    describe 'tags'
      it 'can define a tag and look it up in same scope'
        a.define 'x' withTag 'onFulfilled'
        a.findTag 'onFulfilled'.should.equal 'x'

      it 'can define a tag and look it up in subscope'
        a.define 'x' withTag 'onFulfilled'
        b.findTag 'onFulfilled'.should.equal 'x'
    
    describe 'generated variables'
      it 'generates unique variables'
        b.generateVariable 'a'.should.not.equal (b.generateVariable 'a')

      it 'generates variables that are different to user variables'
        b.generateVariable 'a'.should.not.equal 'a'
