terms = require '../../lib/parser/codeGenerator'.code generator ()
should = require 'should'
codegen utils = require '../../lib/terms/codegenUtils'
equals = require '../containsFields'.contains fields

describe 'definitions'
    variables = nil
    scope = nil
    variable = nil

    before each
        scope := @new terms.Symbol Scope (nil)
        variables := codegen utils.declared variables (scope)
        variable := terms.variable ['a', 'b']
        terms.errors.clear ()

    describe 'declare variables'
        def = nil

        before each
            def := terms.definition (variable, terms.nil ())

        context 'when shadow'
            before each
                def := terms.definition (variable, terms.nil (), shadow: true)

            it 'should declare the variable'
                def.declare variables (variables, scope)
                (variables.unique variables ()) equals ['aB']

            context 'and when already in scope'
                before each
                    scope.define 'aB'

                it 'should still declare the variable'
                    def.declare variables (variables, scope)
                    (variables.unique variables ()) equals ['aB']

        it 'should declare the variable'
            def.declare variables (variables, scope)
            (variables.unique variables ()) equals ['aB']

        context 'and when already in scope'
            before each
                scope.define 'aB'

            it 'should add an error saying that variable is already defined'
                def.declare variables (variables, scope)
                should.equal (terms.errors.has errors (), true)
                terms.errors.errors.0.message.should.match r/variable a b is already defined/

        context 'when assignment'
            before each
                def := terms.definition (variable, terms.nil (), assignment: true)

            it 'should add an error saying that variable is not yet defined'
                def.declare variables (variables, scope)
                should.equal (terms.errors.has errors (), true)
                terms.errors.errors.0.message.should.match r/variable a b is not defined/

            context 'and when already in scope'
                before each
                    scope.define 'aB'

                it 'should not declare the variable'
                    def.declare variables (variables, scope)
                    (variables.unique variables ()) equals []
