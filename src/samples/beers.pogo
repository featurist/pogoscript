sing @n bottles of beer on the wall =
    if (n > 0)
        console : log (@n bottles of beer on the wall)
        sing (n - 1) bottles of beer on the wall

@n bottles of beer on the wall =
    "@(@n bottles) of beer on the wall, @(@n bottles) of beer on the wall
     take one down, pass it around, @((n - 1) bottles) of beer on the wall."

@n bottles =
    if (n == 0)
        "no bottles"
    else if (n == 1)
        "1 bottle"
    else
        "@n bottles"

sing 99 bottles of beer on the wall