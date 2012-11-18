current continuation (callback) =
    continuation () =
        callback (nil, continuation)

    callback (nil, continuation)

n = 0

cont = current continuation!

console.log (n)
++n

if (n < 10)
    cont ()
