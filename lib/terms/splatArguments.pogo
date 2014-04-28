_ = require 'underscore'

module.exports (terms) =
    splatArgumentsTerm = terms.term {
        constructor (splatArguments) =
            self.splatArguments = splatArguments

        generate (scope) =
            self.generateIntoBuffer @(buffer)
                for (i = 0, i < self.splatArguments.length, ++i)
                    splatArgument = self.splatArguments.(i)

                    if (i == 0)
                        buffer.write (splatArgument.generate (scope))
                    else
                        buffer.write ('.concat(')
                        buffer.write (splatArgument.generate (scope))
                        buffer.write (')')
    }

    splatArguments (args, optionalArgs) =
        splatArgs = []
        previousArgs = []
        foundSplat = false
        
        i = 0
        while (i < args.length)
            current = args.(i)
            next = args.(i + 1)
            if (next @and next.isSplat)
                foundSplat := true
                if (previousArgs.length > 0)
                    splatArgs.push (terms.list (previousArgs))
                    previousArgs := []

                splatArgs.push (current)
                ++i
            else if (current.isSplat)
                terms.errors.addTerm (current) withMessage 'splat keyword with no argument to splat'
            else
                previousArgs.push (current)

            ++i
        
        if (optionalArgs @and (optionalArgs.length > 0))
            previousArgs.push (terms.hash (optionalArgs))
        
        if (previousArgs.length > 0)
            splatArgs.push (terms.list (previousArgs))
        
        if (foundSplat)
            concat (initial, last) =
                if (initial.length > 0)
                    terms.methodCall (concat (_.initial (initial), _.last (initial)), ['concat'], [last])
                else
                    last

            concat (_.initial (splatArgs), _.last (splatArgs))
