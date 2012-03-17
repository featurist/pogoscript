exports: create interpolation! = {
    stack = []

    start interpolation! =
        :stack: unshift {brackets = 0}

    open bracket! =
        :stack: 0: brackets = :stack: 0: brackets + 1

    close bracket! =
        :stack: 0: brackets = :stack: 0: brackets - 1

    finished interpolation? =
        :stack: 0: brackets < 0

    stop interpolation! =
        :stack: shift!

    interpolating? =
        :stack: length > 0
}
