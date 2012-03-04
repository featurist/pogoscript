_ = require 'underscore'

exports: create macro directory? = object =>
    :add macro (pattern) (create macro) =
        regex pattern = :pattern compiler: compile pattern (pattern)
        console: log (regex pattern)

exports: create pattern compiler! = object =>
    :compile pattern (pattern) =
        new (RegExp (pattern: as regexp?))

exports: seq (keywords) = {
    as regexp? =
        _: map (keywords) @(keyword)
            keyword: as regexp?
        : join ''
}

exports: zero or more (pattern) = {
    as regexp? =
        "(@(pattern: as regexp?))*"
}

exports: opt (pattern) = {
    as regexp? =
        "(@(pattern: as regexp?))?"
}

exports: kw (value) = {
    as regexp? =
        value + ';'
}
