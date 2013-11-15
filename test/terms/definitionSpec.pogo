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
        variables := codegen utils.defined variables (scope)
        variable := terms.variable ['a', 'b']
        terms.errors.clear ()

    describe 'define variables'
        def = nil

        before each
            def := terms.definition (variable, terms.nil ())

        context 'when shadow'
            before each
                def := terms.definition (variable, terms.nil (), shadow: true)

            it 'should define the variable'
                def.define variables (variables, scope)
                (variables.unique variables ()) equals ['aB']

            context 'and when already in scope'
                before each
                    scope.define 'aB'

                it 'should still define the variable'
                    def.define variables (variables, scope)
                    (variables.unique variables ()) equals ['aB']

        it 'should define the variable'
            def.define variables (variables, scope)
            (variables.unique variables ()) equals ['aB']

        context 'and when already in scope'
            before each
                scope.define 'aB'

            it 'should add an error saying that variable is already defined'
                def.define variables (variables, scope)
                should.equal (terms.errors.has errors (), true)
                terms.errors.errors.0.message.should.match r/variable a b is already defined/

        context 'when assignment'
            before each
                def := terms.definition (variable, terms.nil (), assignment: true)

            it 'should add an error saying that variable is not yet defined'
                def.define variables (variables, scope)
                should.equal (terms.errors.has errors (), true)
                terms.errors.errors.0.message.should.match r/variable a b is not defined/

            context 'and when already in scope'
                before each
                    scope.define 'aB'

                it 'should not define the variable'
                    def.define variables (variables, scope)
                    (variables.unique variables ()) equals []
