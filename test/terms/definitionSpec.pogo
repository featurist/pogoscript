terms = require '../../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
should = require 'should'
codegen utils = require '../../lib/codegenUtils'

describe 'definitions'
    variables = nil
    scope = nil
    variable = nil

    before each
        scope := @new terms.Symbol Scope (nil)
        variables := codegen utils.declared variables (scope)
        variable := terms.variable ['a', 'b']

    describe 'declare variables'
        def = nil

        before each
            def := terms.definition (variable, terms.nil ())

        context 'when shadow'
            before each
                def := terms.definition (variable, terms.nil (), shadow: true)

            it 'should declare the variable'
                def.declare variables (variables, scope)
                variables.unique variables ().should.eql ['aB']

            context 'and when already in scope'
                before each
                    scope.define 'aB'

                it 'should still declare the variable'
                    def.declare variables (variables, scope)
                    variables.unique variables ().should.eql ['aB']

        it 'should declare the variable'
            def.declare variables (variables, scope)
            variables.unique variables ().should.eql ['aB']

        context 'and when already in scope'
            before each
                scope.define 'aB'

            it 'should add an error'
                def.declare variables (variables, scope)
                should.equal (terms.errors.has errors (), true)
                terms.errors.errors.0.message.should.match r/variable a b already defined/

        context 'when assignment'
            before each
                def := terms.definition (variable, terms.nil (), assignment: true)

            it 'should not declare the variable'
                def.declare variables (variables, scope)
                variables.unique variables ().should.eql []

            context 'and when already in scope'
                before each
                    scope.define 'aB'

                it 'should not declare the variable'
                    def.declare variables (variables, scope)
                    variables.unique variables ().should.eql []
