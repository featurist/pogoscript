require 'cupoftea'
cg = require './codeGenerator/codeGenerator'
require './assertions.pogo'
assert = require 'assert'

spec 'basic expression'
  with terminals @terminals should not have arguments =
    ex = cg: basic expression @terminals
    (ex: has arguments?) should be falsy
    
  with terminals @terminals should have arguments =
    ex = cg: basic expression @terminals
    (ex: has arguments?) should be truthy
  
  variable = cg: variable ['a']
  block = cg: block [] (cg: statements [variable])
  id @name = cg: identifier @name
  int @n =
    cg: integer @n
    
  string @n =
    cg: string @n
  
  no arg punctuation = cg: no arg suffix?
  
  spec 'has arguments'
    spec 'with one variable'
      with terminals [variable] should have arguments
    
    spec 'with a block'
      with terminals [block] should have arguments
    
    spec 'with name and a block'
      with terminals [id 'c'. block] should have arguments
    
    spec 'with name, no arguments but a no arg punctuation'
      with terminals [id 'c'. no arg punctuation] should have arguments
      
  spec 'doesnt have arguments'
    spec 'with just an identifier'
      with terminals [id 'a'] should not have arguments
      
    spec 'with two identifiers'
      with terminals [id 'a'. id 'b'] should not have arguments

  spec 'arguments'
    terminals @terminals should have arguments @arguments =
      (cg: basic expression @terminals: arguments?) should contain fields @arguments
    
    spec 'single variable'
      terminals [variable] should have arguments [variable]
    
    spec 'variable with name'
      terminals [id 'move'. variable] should have arguments [variable]
    
    spec 'block'
      terminals [block] should have arguments [{
        is block
        body {
          statements [{is variable, variable ['a']}]
        }
      }]
    
    spec 'block with a parameter'
      terminals [cg: parameter (cg: variable ['x']). block] should have arguments [{
        is block
        parameters [{is parameter, expression {variable ['x']}}]
        body {
          statements [{is variable, variable ['a']}]
        }
      }]

  spec 'parameters'
    target @expression has some parameters =
      (cg: basic expression @expression: has parameters?) should be truthy
      
    target @expression doesnt have some parameters =
      (cg: basic expression @expression: has parameters?) should be falsy
  
    target @expression has parameters @parameters =
      (cg: basic expression @expression: parameters?) should contain fields @parameters
  
    spec 'single name'
      target [id 'car'] doesnt have some parameters
  
    spec 'name and variable'
        spec 'has parameters'
            target [id 'car'. variable] has some parameters

        spec 'parameters'
            target [id 'car'. variable] has parameters [{is parameter, expression {variable ['a']}}]
  
    spec 'no arg punctuation'
        spec 'has parameters'
            target [id 'car'. no arg punctuation] has some parameters
            
        spec 'parameters'
            target [id 'car'. no arg punctuation] has parameters []
    
  spec 'has name'
    terminals @terminals should have a name =
      (cg: basic expression @terminals: has name?) should be truthy

    spec 'with two identifiers'
      terminals [id 'car'. id 'idle'] should have a name

  spec 'name'
    terminals @terminals should have name @name =
      (cg: basic expression @terminals: name?) should contain fields @name
      
    spec 'with two identifiers'
      terminals [id 'car'. id 'idle'] should have name ['car'. 'idle']
      
    spec 'with two identifiers and arg'
      terminals [id 'car'. cg: variable ['car']. id 'idle'] should have name ['car'. 'idle']

  spec 'hash entry'
    hash entry @terminals should contain fields @f =
      (cg: basic expression @terminals: hash entry?) should contain fields @f
  
    spec 'with an argument'
      hash entry [id 'port'. int 10] should contain fields {
        is hash entry
        field ['port']
        value {integer 10}
      }
  
    spec 'without an argument'
      hash entry [id 'port'] should contain fields {
        is hash entry
        field ['port']
        value @undefined
      }
  
    spec 'with a string name'
      hash entry [string 'the port'. int 8] should contain fields {
        is hash entry
        field ['the port']
        value {integer 8}
      }

  spec 'hash entry, without block'
    hash entry @terminals should contain fields @f =
      (cg: basic expression @terminals: hash entry, without block) should contain fields @f
      
    spec 'with block'
      hash entry [id 'port'. int 10. block] should contain fields {
        is hash entry
        field ['port']
        value {integer 10}
      }
      
    spec 'without arguments'
      hash entry [id 'port'] should contain fields {
        is hash entry
        field ['port']
        value @undefined
      }

  spec 'hash entry block'
    hash entry block @terminals should contain fields @f =
      (cg: basic expression @terminals: hash entry block?) should contain fields @f

    spec 'with block'
      hash entry block [id 'port'. int 10. block] should contain fields {
        is block
        body {statements [{variable ['a']}]}
      }

    spec 'without block'
      assert: (cg: basic expression [id 'port'. int 10]: hash entry block?) equal @undefined

    spec 'without hash'
      assert: (cg: basic expression [id 'port']: hash entry block?) equal @undefined
