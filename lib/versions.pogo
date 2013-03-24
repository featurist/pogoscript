_ = require 'underscore'

exports.(a) is less than (b) =
    parse version (v) =
        if (v.0 == 'v')
            v := v.substring (1)

        _.map (v.split '.') @(n)
            parse int (n)

    compare (v1, v2) =
        if (v1 > v2)
            1
        else if (v2 > v1)
            -1
        else
            0

    for each @(version numbers) in (_.zip (parse version (a), parse version (b)))
        comparison = compare (version numbers.0, version numbers.1)

        if (comparison)
            return (comparison < 0)
    
    false
