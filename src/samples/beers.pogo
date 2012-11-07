sing (n) bottles of beer on the wall =
    if (n > 0)
        console.log "#((n) bottles) of beer on the wall, #((n) bottles) of beer.
                     Take one down and pass it around, #((n - 1) bottles) of beer on the wall."
        sing (n - 1) bottles of beer on the wall
    else if (n == 0)
        console.log "No more bottles of beer on the wall, no more bottles of beer.
                     Go to the store and buy some more, 99 bottles of beer on the wall."

(n) bottles =
    if (n == 0)
        "no more bottles"
    else if (n == 1)
        "1 bottle"
    else
        "#(n) bottles"

sing 99 bottles of beer on the wall
