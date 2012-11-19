module.exports (terms) = {
    asyncify arguments (arguments, optional arguments) =
        for each @(arg) in (arguments)
            arg.asyncify ()

        for each @(opt arg) in (optional arguments)
            opt arg.asyncify ()

    asyncify body (body, args) =
        if (body)
            closure = terms.closure (args || [], body)
            closure.asyncify ()
            closure
        else
            terms.nil ()
}
