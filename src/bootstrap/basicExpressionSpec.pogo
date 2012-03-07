cg = require './codeGenerator/codeGenerator'
require './assertions.pogo'
assert = require 'assert'

describe 'basic expression'
  with terminals (terminals) should not have arguments =
    ex = cg: basic expression (terminals)
    (ex: has arguments?) should be falsy
    
  with terminals (terminals) should have arguments =
    ex = cg: basic expression (terminals)
    (ex: has arguments?) should be truthy
  
  variable = cg: variable ['a']
  block = cg: block [] (cg: statements [variable])
  id (name) = cg: identifier (name)
  int (n) =
    cg: integer (n)
    
  string (n) =
    cg: string (n)
  
  no arg punctuation = cg: no arg suffix?
  
  describe 'has arguments'
    it 'with one variable'
      with terminals [variable] should have arguments
    
    it 'with a block'
      with terminals [block] should have arguments
    
    it 'with name and a block'
      with terminals [id 'c', block] should have arguments
    
    it 'with name, no arguments but a no arg punctuation'
      with terminals [id 'c', no arg punctuation] should have arguments
    
    it 'with name and empty argument list'
      with terminals [id 'c', cg: argument list []] should have arguments
      
  describe 'doesnt have arguments'
    it 'with just an identifier'
      with terminals [id 'a'] should not have arguments
      
    it 'with two identifiers'
      with terminals [id 'a', id 'b'] should not have arguments

  describe 'arguments'
    terminals (terminals) should have arguments (arguments) =
      (cg: basic expression (terminals): arguments?) should contain fields (arguments)
    
    it 'single variable'
      terminals [variable] should have arguments [variable]
    
    it 'variable with name'
      terminals [id 'move', variable] should have arguments [variable]
    
    it 'with name and empty argument list'
      terminals [id 'c', cg: argument list []] should have arguments []
    
    it 'block'
      terminals [block] should have arguments [{
        is block
        body {
          statements [{is variable, variable ['a']}]
        }
      }]
    
    it 'block with a parameter'
      terminals [cg: parameters ([cg: variable ['x']]), block] should have arguments [{
        is block
        parameters [{variable ['x']}]
        body {
          statements [{is variable, variable ['a']}]
        }
      }]

  describe 'parameters'
    target (expression) has some parameters =
      (cg: basic expression (expression): has parameters?) should be truthy
      
    target (expression) doesnt have some parameters =
      (cg: basic expression (expression): has parameters?) should be falsy
  
    target (expression) has parameters (parameters) =
      (cg: basic expression (expression): parameters?) should contain fields (parameters)
  
    it 'single name'
      target [id 'car'] doesnt have some parameters
  
    describe 'name and variable'
        it 'has parameters'
            target [id 'car', variable] has some parameters

        it 'parameters'
            target [id 'car', variable] has parameters [{variable ['a']}]
  
    describe 'no arg punctuation'
        it 'has parameters'
            target [id 'car', no arg punctuation] has some parameters
            
        it 'parameters'
            target [id 'car', no arg punctuation] has parameters []
  
    describe 'empty argument list'
        it 'has parameters'
            target [id 'car', cg: argument list []] has some parameters
            
        it 'parameters'
            target [id 'car', cg: argument list []] has parameters []
    
  describe 'has name'
    terminals (terminals) should have a name =
      (cg: basic expression (terminals): has name?) should be truthy

    it 'with two identifiers'
      terminals [id 'car', id 'idle'] should have a name

  describe 'name'
    terminals (terminals) should have name (name) =
      (cg: basic expression (terminals): name?) should contain fields (name)
      
    it 'with two identifiers'
      terminals [id 'car', id 'idle'] should have name ['car', 'idle']
      
    it 'with two identifiers and arg'
      terminals [id 'car', cg: variable ['car'], id 'idle'] should have name ['car', 'idle']

  describe 'hash entry'
    hash entry (terminals) should contain fields (f) =
      (cg: basic expression (terminals): hash entry?) should contain fields (f)
  
    it 'with an argument'
      hash entry [id 'port', int 10] should contain fields {
        is hash entry
        field ['port']
        value {integer 10}
      }
  
    it 'without an argument'
      hash entry [id 'port'] should contain fields {
        is hash entry
        field ['port']
        value = undefined
      }
  
    it 'with a string name'
      hash entry [string 'the port', int 8] should contain fields {
        is hash entry
        field ['the port']
        value {integer 8}
      }

  describe 'hash entry, without block'
    hash entry (terminals) should contain fields (f) =
      (cg: basic expression (terminals): hash entry; without block) should contain fields (f)
      
    it 'with block'
      hash entry [id 'port', int 10, block] should contain fields {
        is hash entry
        field ['port']
        value {integer 10}
      }
      
    it 'without arguments'
      hash entry [id 'port'] should contain fields {
        is hash entry
        field ['port']
        value = undefined
      }

  describe 'hash entry block'
    hash entry block (terminals) should contain fields (f) =
      (cg: basic expression (terminals): hash entry block?) should contain fields (f)

    it 'with block'
      hash entry block [id 'port', int 10, block] should contain fields {
        is block
        body {statements [{variable ['a']}]}
      }

    it 'without block'
      assert: (cg: basic expression [id 'port', int 10]: hash entry block?) equal (undefined)

    it 'without hash'
      assert: (cg: basic expression [id 'port']: hash entry block?) equal (undefined)

  describe 'hash key'
    it 'if string then should return array containing string'
      key = cg: basic expression [string 'port']: hash key?
      
      (key) should contain fields ['port']
      
    it 'if variable then should return array containing string'
      key = cg: basic expression [id 'port']: hash key?
      
      (key) should contain fields ['port']
