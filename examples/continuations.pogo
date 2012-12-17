current continuation! () =
    cont () =
        continuation (nil, cont)

    continuation (nil, cont)

n = 0

cont = current continuation!

console.log (n)
++n

if (n < 10)
    cont ()
