remove (arg) from (args) =
    index = args.index of (arg)
    if (index > -1)
        rest = args.slice (index + 1)
        args.length = index
        args.push (rest, ...)

move (arg) to head of (args) =
    remove (arg) from (args)
    args.unshift (arg)
    

node arguments =
    args = process.argv.slice (1)

    if (options.debug)
        move '--debug' to head of (args)

    if (options.debug brk)
        move '--debug-brk' to head of (args)

    if (options._.0 == 'debug')
        move 'debug' to head of (args)

    args

exports.debug pogo () =
    child process = require 'child_process'
    child process.spawn (process.argv.0, node arguments, custom fds: [0, 1, 2])
