factorial (n) =
    if (n == 0)
        1
    else
        n * factorial (n - 1)

print factorial (n) = console : log "factorial #(n): #(factorial (n))"

print factorial 3
print factorial 5
print factorial 10
