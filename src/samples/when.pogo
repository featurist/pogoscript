is (expected) (action) =
    action if (actual) matched =
        if (expected == actual)
            action

otherwise (action) =
    action if (actual) matched =
        action

when (actual, cases) =
    for each @(action if matched) in (cases)
        action = action if (actual) matched
        if (action)
            return (action!)

print (args, ...) = console: log (args, ...)

x = 2

when (x) [
    is 0
        print "x is zero"

    is 1
        print "x is one"

    otherwise
        print "x is not zero or one"
]
