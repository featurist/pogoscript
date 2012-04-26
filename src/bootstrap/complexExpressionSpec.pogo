cg = require './codeGenerator/codeGenerator'
require './assertions.pogo'

int (n) =
  cg: integer (n)

loc = {first line 1, last line 1, first column 7, last column 13}

id (name) = cg: loc (cg: identifier (name), loc)

variable (name) = cg: variable [name]

parameter (name) = cg: parameter [name]

block = cg: block [] (cg: statements [variable 'x'])

string (value) = cg: string (value)

no arg punctuation = cg: no arg suffix?

describe 'complex expression'
  describe 'has arguments'
    expression (e) should have arguments =
      (cg: complex expression (e): has arguments?) should be truthy
    
    it 'with arguments in head'
      expression [[id 'a', int 10]] should have arguments
    
    it 'with no arg arguments'
      expression [[id 'a', no arg punctuation]] should have arguments
    
    it 'with tail block'
      expression [[id 'a'], [id 'readonly', block]] should have arguments
      
  describe 'arguments'
    expression (e) should have arguments (a) =
      (cg: complex expression (e): arguments?) should contain fields (a)
    
    it 'with arguments in head'
      expression [[id 'a', int 10]] should have arguments [{integer 10}]
    
    it 'with tail block'
      expression [[id 'a'], [id 'readonly', block]] should have arguments [
        {is block}
      ]

  describe 'expression'
    expression (e) should contain fields (f) =
      (cg: complex expression (e): expression?) should contain fields (f)

    it 'with just one argument is that argument'
      expression [[int 9]] should contain fields {
        is integer
        integer 9
      }

    it 'all arguments is function call, first argument is function'
      expression [[variable 'z', int 9]] should contain fields {
        is function call
        function {variable ['z']}
        arguments [{integer 9}]
      }

    it 'one argument and call punctuation is function call'
      expression [[variable 'z', no arg punctuation]] should contain fields {
        is function call
        function {variable ['z']}
        arguments []
      }

    it 'with name is variable'
      expression [[id 'a', id 'variable']] should contain fields {
        is variable
        variable ['a', 'variable']
      }

    it 'with name and argument is function call'
      expression [[id 'a', id 'variable', int 10]] should contain fields {
        is function call
        function {is variable, variable ['a', 'variable']}
        arguments [{integer 10}]
      }

    it 'finds macro with arguments'
      expression [[id 'if', variable 'x', block]] should contain fields {
        is if expression
      }

    it 'finds macro with no arguments'
      expression [[id 'nil']] should contain fields {
        source 'void 0'
      }

    it 'with name and optional args is function call with optional args'
      expression [[id 'a', id 'variable'], [id 'port', int 80]] should contain fields {
        is function call
        function {is variable, variable ['a', 'variable']}
        arguments []
        optional arguments [{field ['port'], value {integer 80}}]
      }

    it 'with block after optional arguments'
      expression [[id 'a', id 'variable'], [id 'port', int 80, block]] should contain fields {
        is function call
        function {is variable, variable ['a', 'variable']}
        arguments [
            {
                is block
                body {
                  statements [
                    {variable ['x']}
                  ]
                }
            }
        ]
        optional arguments [{field ['port'], value {integer 80}}]
      }

  describe 'object operation -> expression'
    expression (object, operation) should contain fields (fields) =
      (cg: complex expression (operation): object operation (object): expression?) should contain fields (fields)
  
    it 'method call'
      expression (variable 'a') [[id 'method', int 10]] should contain fields {
        is method call
        object {variable ['a']}
        name ['method']
        arguments [{integer 10}]
      }
  
    it 'method call with optional arguments'
      expression (variable 'a') [[id 'method', int 10], [id 'port', int 80]] should contain fields {
        is method call
        object {variable ['a']}
        name ['method']
        arguments [{integer 10}]
        optional arguments [{field ['port'], value {integer 80}}]
      }

    it 'index'
      expression (variable 'a') [[int 10]] should contain fields {
        is indexer
        object {variable ['a']}
        indexer {integer 10}
      }

    it 'index call with arguments'
      expression (variable 'a') [[variable 'z', int 10]] should contain fields {
        is function call
        function {
          is indexer
          object {variable ['a']}
          indexer {variable ['z']}
        }
        
        arguments [{integer 10}]
      }

    it 'index call with no arguments'
      expression (variable 'a') [[variable 'z', no arg punctuation]] should contain fields {
        is function call
        function {
          is indexer
          object {variable ['a']}
          indexer {variable ['z']}
        }
        
        arguments []
      }

    it 'field reference'
      expression (variable 'a') [[id 'field']] should contain fields {
        is field reference
        object {variable ['a']}
        name ['field']
      }

  describe 'hash entry'
    hash entry (expression) should contain fields (fields) =
      (cg: complex expression (expression): hash entry?) should contain fields (fields)
    
    it 'if contains one component that is the hash entry'
      hash entry [[id 'field']] should contain fields {
        is hash entry
        field ['field']
        value = undefined
      }
    
    it 'if contains more than component then semantic error'
      hash entry [[id 'field'], [id 'secondField']] should contain fields {
        is semantic failure
      }

  describe 'definition -> hash entry'
    it 'string key'
      hash entry = cg: complex expression [[string 'port']]: definition (cg: variable ['a']): hash entry?
      
      (hashEntry) should contain fields {
        is hash entry
        field ['port']
        value {variable ['a']}
      }
      
    it 'identifier key'
      hash entry = cg: complex expression [[id 'port']]: definition (cg: variable ['a']): hash entry?
      
      (hashEntry) should contain fields {
        is hash entry
        field ['port']
        value {variable ['a']}
      }
      
    it "field's value can be on a new indented line"
      hash entry = cg: complex expression [[id 'port']]: definition (cg: block ([], cg: statements [cg: variable ['a']])): hash entry?
      
      (hashEntry) should contain fields {
        is hash entry
        field ['port']
        value {
          is scope
          statements [variable ['a']]
        }
      }
      
    it 'can define a method as a hash key'
      hash entry = cg: complex expression [[id 'name', variable 'name']]: definition (cg: variable ['name']): hash entry?
      
      (hashEntry) should contain fields {
        is hash entry
        field ['name']
        value {
            is block

            body {
                statements [
                    {variable ['name']}
                ]
            }

            parameters [{variable ['name']}]

            redefines self
        }
      }

  describe 'object operation -> definition'
    definition (object, operation, source) should contain fields (fields) =
      (cg: complex expression (operation): object operation (object): definition (source): expression?) should contain fields (fields)
    
    it 'method definition'
      definition (variable 'object') [[id 'method', variable 'x']] (block) should contain fields {
        is definition
        target {
          is field reference
          name ['method']
          object {variable ['object']}
        }
        
        source {
          is block
          parameters [{variable ['x']}]
        }
      }
    
    it 'method definition without block'
      definition (variable 'object') [[id 'method', variable 'x']] (variable 'y') should contain fields {
        is definition
        target {
          is field reference
          name ['method']
          object {variable ['object']}
        }
        
        source {
          is block
          redefines self
          parameters [{variable ['x']}]
          body {statements [{variable ['y']}]}
        }
      }
    
    it 'field definition'
      definition (variable 'object') [[id 'x']] (variable 'y') should contain fields {
        is definition
        target {
          is field reference
          name ['x']
          object {variable ['object']}
        }
        
        source {
          is variable
          variable ['y']
        }
      }
    
    it 'index definition'
      definition (variable 'object') [[variable 'x']] (variable 'y') should contain fields {
        is definition
        target {
          is indexer
          indexer {variable ['x']}
          object {variable ['object']}
        }
        
        source {
          is variable
          variable ['y']
        }
      }
    
    it 'index method definition'
      definition (variable 'object') [[cg: string 'xyz', variable 'p']] (variable 'y') should contain fields {
        is definition
        target {
          is indexer
          indexer {string 'xyz'}
          object {variable ['object']}
        }
        
        source {
          is block
          body {
            statements [
              {
                is variable
                variable ['y']
              }
            ]
          }
          
          parameters [
            {variable ['p']}
          ]
        }
      }
    
    it 'index method definition with no args'
      definition (variable 'object') [[cg: string 'xyz', no arg punctuation]] (variable 'y') should contain fields {
        is definition
        target {
          is indexer
          indexer {string 'xyz'}
          object {variable ['object']}
        }
        
        source {
          is block
          body {
            statements [
              {
                is variable
                variable ['y']
              }
            ]
          }
          
          parameters [
          ]
        }
      }

  describe 'definition'
    definition (target, source) should contain fields (fields) =
      (cg: complex expression (target): definition (source): expression?) should contain fields (fields)
    
    it 'function definition'
      definition [[id 'function', variable 'x']] (block) should contain fields {
        is definition
        target {
          is variable
          variable ['function']
        }
        
        source {
          is block
          parameters [{variable ['x']}]
          body {statements [{variable ['x']}]}
        }
      }
    
    it 'function definition with optional parameter'
      definition [[id 'function', variable 'x'], [id 'port', int 80], [id 'name']] (variable 'y') should contain fields {
        is definition
        target {
          is variable
          variable ['function']
        }
        
        source {
          is block
          parameters [{variable ['x']}]
          optional parameters [
            {field ['port'], value {integer 80}}
            {field ['name'], value = undefined}
          ]
          body {statements [{variable ['y']}]}
        }
      }
    
    it 'function definition without block'
      definition [[id 'function', variable 'x']] (variable 'y') should contain fields {
        is definition
        target {
          is variable
          variable ['function']
        }
        
        source {
          is block
          parameters [{variable ['x']}]
          body {statements [{variable ['y']}]}
        }
      }
    
    it 'no arg function definition'
      definition [[id 'function', no arg punctuation]] (variable 'y') should contain fields {
        is definition
        target {
          is variable
          variable ['function']
        }
        
        source {
          is block
          parameters []
          body {statements [{variable ['y']}]}
        }
      }
    
    it 'function definition with empty param list'
      definition [[id 'function', cg: argument list []]] (variable 'y') should contain fields {
        is definition
        target {
          is variable
          variable ['function']
        }
        
        source {
          is block
          parameters []
          body {statements [{variable ['y']}]}
        }
      }
    
    it 'variable definition'
      definition [[id 'function']] (variable 'y') should contain fields {
        is definition
        target {
          is variable
          variable ['function']
        }
        
        source {
          is variable
          variable ['y']
        }
      }

    it 'variable definition with scope'
      definition [[id 'function']] (cg: block [] (cg: statements [variable 'y'])) should contain fields {
        is definition
        target {
          is variable
          variable ['function']
        }
        
        source {
          is scope
          statements [{variable ['y']}]
        }
      }

    describe 'parameter'
        parameter (p) should contain fields (fields) =
            (cg: complex expression (p): expression?: parameter?) should contain fields (fields)
        
        it 'variable'
            parameter [[id 'a']] should contain fields {variable ['a']}
