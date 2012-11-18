last yield continuation = nil
last result continuation = nil

yield (n, yield continuation) =
    last yield continuation := yield continuation
    last result continuation (nil, n)

coroutine (block) =
    run (result continuation) =
        last result continuation := result continuation

        if (last yield continuation)
            last yield continuation ()
        else
            block
                last yield continuation := nil
                last result continuation := nil

strings = coroutine
    yield! 1
    yield! 2
    yield! 3

console.log (strings!)
console.log (strings!)
console.log (strings!)
console.log 'finished'
