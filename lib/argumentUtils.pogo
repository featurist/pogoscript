exports.asyncify arguments (arguments, optional arguments) =
    for each @(arg) in (arguments)
        arg.asyncify ()

    for each @(arg) in (optional arguments)
        arg.asyncify ()
