_ = require 'underscore'

module.exports (terms) =
    splat arguments term = terms.term {
        constructor (splat arguments) =
            self.splat arguments = splat arguments

        generate java script (buffer, scope) =
            for (i = 0, i < self.splat arguments.length, ++i)
                splat argument = self.splat arguments.(i)

                if (i == 0)
                    splat argument.generate java script (buffer, scope)
                else
                    buffer.write ('.concat(')
                    splat argument.generate java script (buffer, scope)
                    buffer.write (')')
    }

    splat arguments (args, optional args) =
        splat args = []
        previous args = []
        found splat = false
        
        i = 0
        while (i < args.length)
            current = args.(i)
            next = args.(i + 1)
            if (next && next.is splat)
                found splat := true
                if (previous args.length > 0)
                    splat args.push (terms.list (previous args))
                    previous args := []

                splat args.push (current)
                ++i
            else if (current.is splat)
                terms.errors.add term (current) with message 'splat keyword with no argument to splat'
            else
                previous args.push (current)

            ++i
        
        if (optional args && (optional args.length > 0))
            previous args.push (terms.hash (optional args))
        
        if (previous args.length > 0)
            splat args.push (terms.list (previous args))
        
        if (found splat)
            concat (initial, last) =
                if (initial.length > 0)
                    terms.method call (concat (_.initial (initial), _.last (initial)), ['concat'], [last])
                else
                    last

            concat (_.initial (splat args), _.last (splat args))
