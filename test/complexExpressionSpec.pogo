terms = require '../lib/parser/codeGenerator'.code generator ()
require './assertions'

int (n) =
  terms.integer (n)

loc = {first line 1, last line 1, first column 7, last column 13}

id (name) = terms.loc (terms.identifier (name), loc)

variable (name) = terms.variable [name]

parameter (name) = terms.parameter [name]

block = terms.block [] (terms.statements [variable 'x'])

string (value) = terms.string (value)

async argument = terms.async argument ()
future argument = terms.future argument ()

describe 'complex expression'
  describe 'has arguments'
    expression (e) should have arguments =
      (terms.complex expression (e).has arguments ()) should be truthy
    
    it 'with arguments in head'
      expression [[id 'a', int 10]] should have arguments
    
    it 'with async argument'
      expression [[id 'a', async argument]] should have arguments
    
    it 'with future argument'
      expression [[id 'a', future argument]] should have arguments
    
    it 'with tail block'
      expression [[id 'a'], [id 'readonly', block]] should have arguments
      
  describe 'arguments'
    expression (e) should have arguments (a) =
      (terms.complex expression (e).arguments ()) should contain fields (a)
    
    it 'with arguments in head'
      expression [[id 'a', int 10]] should have arguments [{integer 10}]
    
    it 'with tail block'
      expression [[id 'a'], [id 'readonly', block]] should have arguments [
        {is block}
      ]

  describe 'expression'
    expression (e) should contain fields (f) =
      (terms.complex expression (e).expression ()) should contain fields (f)

    it 'with just one argument is that argument'
      expression [[int 9]] should contain fields {
        is integer
        integer 9
      }

    it 'all arguments is function call, first argument is function'
      expression [[variable 'z', int 9]] should contain fields {
        is function call
        is async = false
        function {variable ['z']}
        function arguments [{integer 9}]
      }

    describe 'async functions'
        it 'one argument and async argument is async function call'
          expression [[variable 'z', async argument]] should contain fields {
            is sub statements
            statements [
              {
                is definition
                is async
                target {is variable, name ['async', 'result']}
                source {
                  is function call
                  function {variable ['z']}
                  function arguments []
                }
              }
              {is variable, name ['async', 'result']}
            ]
          }

        it 'name and async argument is function call'
          expression [[id 'z', async argument]] should contain fields {
            is sub statements
            statements [
              {
                is definition
                is async
                target {is variable, name ['async', 'result']}
                source {
                  is function call
                  function {variable ['z']}
                  function arguments []
                }
              }
              {is variable, name ['async', 'result']}
            ]
          }

    describe 'future functions'
        it 'one argument and future argument is future function call'
            expression [[variable 'z', future argument]] should contain fields (
                terms.function call (terms.variable ['z'], [], future: true)
            )

        it 'name and future argument is function call'
            expression [[id 'z', future argument]] should contain fields (
                terms.function call (terms.variable ['z'], [], future: true)
            )

    it 'with name is variable'
      expression [[id 'a', id 'variable']] should contain fields {
        is variable
        variable ['a', 'variable']
      }

    it 'with name and argument is function call'
      expression [[id 'a', id 'variable', int 10]] should contain fields {
        is function call
        is async = false
        function {is variable, variable ['a', 'variable']}
        function arguments [{integer 10}]
      }

    it 'hash entries as arguments are optional'
      expression [[id 'a', int 10, terms.hash entry ['port'] (int 80)]] should contain fields {
        is function call
        is async = false
        function {is variable, variable ['a']}
        function arguments [{integer 10}]
        optional arguments [{field ['port'], value {integer 80}}]
      }

    it 'with name and optional args is function call with optional args'
      expression [[id 'a', id 'variable'], [id 'port', int 80]] should contain fields {
        is function call
        is async = false
        function {is variable, variable ['a', 'variable']}
        function arguments []
        optional arguments [{field ['port'], value {integer 80}}]
      }

    it 'with block after optional arguments'
      expression [[id 'a', id 'variable'], [id 'port', int 80, block]] should contain fields {
        is function call
        is async = false
        function {is variable, variable ['a', 'variable']}
        function arguments [
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
      (terms.complex expression (operation).object operation (object).expression ()) should contain fields (fields)
  
    it 'method call'
      expression (variable 'a') [[id 'method', int 10]] should contain fields {
        is method call
        object {variable ['a']}
        name ['method']
        method arguments [{integer 10}]
        is async = false
      }
  
    describe 'future calls'
        it 'future method call'
            expression (variable 'a') [[id 'method', int 10, future argument]] should contain fields (
                terms.method call (terms.variable ['a'], ['method'], [terms.integer 10], future: true)
            )
  
        it 'future index call with arguments'
            expression (variable 'a') [[variable 'z', int 10, future argument]] should contain fields (
                terms.function call (terms.indexer (terms.variable ['a'], terms.variable ['z']), [terms.integer 10], future: true)
            )

        it 'future index call with no arguments'
            expression (variable 'a') [[variable 'z', future argument]] should contain fields (
                terms.function call (terms.indexer (terms.variable ['a'], terms.variable ['z']), [], future: true)
            )

    describe 'async calls'
      it 'async method call'
        expression (variable 'a') [[id 'method', int 10, async argument]] should contain fields {
          is sub statements
          statements [
            {
              is definition
              is async
              target {is variable, name ['async', 'result']}
              source {
                is method call
                object {variable ['a']}
                name ['method']
                method arguments [{integer 10}]
              }
            }
            {is variable, name ['async', 'result']}
          ]
        }

      it 'async index call with arguments'
        expression (variable 'a') [[variable 'z', int 10, async argument]] should contain fields {
          is sub statements
          statements [
            {
              is definition
              is async
              target {is variable, name ['async', 'result']}
              source {
                is function call
                function {
                  is indexer
                  object {variable ['a']}
                  indexer {variable ['z']}
                }
                
                function arguments [{integer 10}]
              }
            }
            {is variable, name ['async', 'result']}
          ]
        }

      it 'async index call with no arguments'
        expression (variable 'a') [[variable 'z', async argument]] should contain fields {
          is sub statements
          statements [
            {
              is definition
              is async
              target {is variable, name ['async', 'result']}
              source {
                is function call
                function {
                  is indexer
                  object {variable ['a']}
                  indexer {variable ['z']}
                }
                
                function arguments []
              }
            }
            {is variable, name ['async', 'result']}
          ]
        }
  
    it 'method call with optional arguments'
      expression (variable 'a') [[id 'method', int 10], [id 'port', int 80]] should contain fields {
        is method call
        object {variable ['a']}
        name ['method']
        method arguments [{integer 10}]
        optional arguments [{field ['port'], value {integer 80}}]
        is async = false
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
        is async = false
        function {
          is indexer
          object {variable ['a']}
          indexer {variable ['z']}
        }
        
        function arguments [{integer 10}]
      }

    it 'index call with no arguments'
      expression (variable 'a') [[variable 'z', terms.argument list []]] should contain fields {
        is function call
        is async = false
        function {
          is indexer
          object {variable ['a']}
          indexer {variable ['z']}
        }
        
        function arguments []
      }

    it 'field reference'
      expression (variable 'a') [[id 'field']] should contain fields {
        is field reference
        object {variable ['a']}
        name ['field']
      }

  describe 'hash entry'
    hash entry (expression) should contain fields (fields) =
      (terms.complex expression (expression).hash entry ()) should contain fields (fields)
    
    it 'if contains one component that is the hash entry'
      hash entry [[id 'field']] should contain fields {
        is hash entry
        field ['field']
        value = undefined
      }
    
    it 'if contains more than component then semantic error'
      hash entry [[id 'field'], [id 'secondField']] should contain fields {
        is semantic error
      }

  describe 'definition -> hash entry'
    it 'string key'
      hash entry = terms.complex expression [[string 'port']].definition (terms.variable ['a']).hash entry ()
      
      (hash entry) should contain fields {
        is hash entry
        field { string 'port'}
        value {variable ['a']}
      }
      
    it 'identifier key'
      hash entry = terms.complex expression [[id 'port']].definition (terms.variable ['a']).hash entry ()
      
      (hash entry) should contain fields {
        is hash entry
        field ['port']
        value {variable ['a']}
      }
      
    it "field's value can be on a new indented line"
      hash entry = terms.complex expression [[id 'port']].definition (terms.block ([], terms.statements [terms.variable ['a']])).hash entry ()
      
      (hash entry) should contain fields {
        is hash entry
        field ['port']
        value {variable ['a']}
      }
      
    it 'can define a method as a hash key'
      hash entry = terms.complex expression [[id 'field', variable 'param']].definition (terms.variable ['name']).hash entry (true)
      
      (hash entry) should contain fields {
        is hash entry
        field ['field']
        value {
            is block

            body {
                statements [
                    {variable ['name']}
                ]
            }

            parameters [{variable ['param']}]

            redefines self = false
        }
      }

  describe 'object operation -> definition'
    definition (object, operation, source) should contain fields (fields) =
      (terms.complex expression (operation).object operation (object).definition (source).expression ()) should contain fields (fields)
    
    it 'method definition'
      definition (variable 'object') [[id 'method', variable 'x']] (block) should contain fields {
        is definition
        is assignment
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
        is assignment
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
        is assignment
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
        is assignment
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
      definition (variable 'object') [[terms.string 'xyz', variable 'p']] (variable 'y') should contain fields {
        is definition
        is assignment
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
    
    describe 'future definitions'
      it 'future index method definition with no args'
        definition (variable 'object') [[terms.string 'method', future argument]] (variable 'result') should contain fields (
            terms.definition (
                terms.indexer (terms.variable ['object'], terms.string 'method')
                terms.variable ['result']
                assignment: true
            )
        )

      it 'future index method definition with args'
        definition (variable 'object') [[terms.string 'method', terms.variable ['arg'], future argument]] (variable 'result') should contain fields (
            terms.definition (
                terms.indexer (terms.variable ['object'], terms.string 'method')
                terms.variable ['result'].blockify ([terms.variable ['arg']], redefines self: true)
                assignment: true
            )
        )
    
    describe 'async definitions'
      it 'async index method definition with no args'
        definition (variable 'object') [[terms.string 'xyz', async argument]] (variable 'y') should contain fields {
          is definition
          is assignment
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
      (terms.complex expression (target).definition (source).expression ()) should contain fields (fields)

    assignment (target, source) should contain fields (fields) =
      (terms.complex expression (target).definition (source, assignment: true).expression ()) should contain fields (fields)
    
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
    
    it 'function assignment'
      assignment [[id 'function', variable 'x']] (block) should contain fields {
        is definition
        is assignment
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
    
    it 'function definition with optional parameter in tail'
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
    
    it 'function definition with optional parameter'
      definition [[id 'function', variable 'x', terms.hash entry ['port'] (int 80), terms.hash entry ['name'] (variable 'nil')]] (variable 'y') should contain fields {
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
            {field ['name'], value = {is nil}}
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
      
    describe 'future'
      it 'future function definition'

    describe 'async'
      it 'async function definition'
        definition [[id 'function', async argument]] (variable 'y') should contain fields {
          is definition
          target {
            is variable
            variable ['function']
          }
          
          source {
            is block
            parameters []
            body {statements [{variable ['y']}]}
            is async = true
          }
        }
    
    it 'function definition with empty param list'
      definition [[id 'function', terms.argument list []]] (variable 'y') should contain fields {
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
    
    it 'variable assignment'
      assignment [[id 'function']] (variable 'y') should contain fields {
        is definition
        is assignment
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
      definition [[id 'function']] (terms.block [] (terms.statements [variable 'y'])) should contain fields {
        is definition
        target {
          is variable
          variable ['function']
        }
        
        source {variable ['y']}
      }

    describe 'parameter'
        parameter (p) should contain fields (fields) =
            (terms.complex expression (p).expression ().parameter ()) should contain fields (fields)
        
        it 'variable'
            parameter [[id 'a']] should contain fields {variable ['a']}
