module.exports (terms) =
    new operator term = terms.term {
        constructor (fn) =
            self.is new operator = true
            self.function call = fn

        generate java script (buffer, scope) =
            buffer.write ('new ')
            if (self.function call.is variable)
                terms.function call (self.function call, []).generate java script (buffer, scope)
            else if (self.function call.is function call && self.function call.has splat arguments ())
                self.cg.block ([], self.cg.statements ([self.function call]), return last statement: false).generate java script (buffer, scope)
            else
                self.function call.generate java script (buffer, scope)
    }

    new operator (fn) =
        if (fn.is function call && fn.has splat arguments ())
            statements = []
            fn.pass this to apply = true
            constructor = terms.block ([], terms.statements ([fn]), return last statement: false)
            constructor variable = terms.generated variable ['c']
            statements.push (terms.definition (constructor variable, constructor))
            statements.push (terms.definition (terms.field reference (constructor variable, ['prototype']), terms.field reference (fn.function, ['prototype'])))
            statements.push (terms.new operator (constructor variable))
            terms.sub statements (statements)
        else
            new operator term (fn)
