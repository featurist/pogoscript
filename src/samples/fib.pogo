fib @i =
    if (i == 0)
        1
    else if (i == 1)
        1
    else
        fib (i - 1) + fib (i - 2)

print fib @n = console : log "fib @n: @(fib @n)"

print fib 6
