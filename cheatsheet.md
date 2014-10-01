---
layout: doc
title: Cheat Sheet
---

# Statements

    statement 1
    statement 2

Or separated by commas:

    statement 1, statement 2

# Variables

Variables can contain alphas, spaces, numbers, `$` and `_`.

## Defining

    small number = 8

Or in a scoped block:

    small number =
        n = 2
        Math.(n) pow 3

## Assigning

Once a variable is defined, you can re-assign it using `:=`

    small number = 8
    small number := 9

## JavaScript Interop

`small number` is the same as `smallNumber`

# Calling Functions

    move file "logbook.txt" to dir "~/docs"

## Variable Arguments

    filename = "logbook.txt"
    docs dir = "~/docs"
    move file (filename) to dir (docs dir)

## With Optional Arguments

    web server (port: 80)

## With Splat Arguments

    sum (numbers) ...

Or

    sum (numbers, ...)

## [Block](guide/blocks.html) Arguments

    set timeout
        console.log "hi!"
    1000

Or all on one line:

    set timeout @{console.log "hi!"} 1000

## [Block](guide/blocks.html) Parameters

    map each @(name) in (names) into
        "<div class='name'>#(name)</div>"

# Async

## With Promises

Use the `!` operator:

    users.findByName! 'Jack'

As with other arguments, the `!` operator can be placed anywhere in the function call:

    users.findByName 'Jack'!

## With Callbacks

Use the `!` operator, but place a `^` where the callback should be:

    fs.readFile('some.txt', 'utf-8', ^)!

# Defining Functions

    move file (filename) to dir (dir name) =
        ...

## With Optional Parameters

    web server (port: 80) = ...

## With Splat Parameters

    sum (numbers) ... =
        ...

# Objects

## Calling Methods

    date = @new Date 2011 4 5
    month = date.get month ()
    date.set minutes 5



## Defining Methods and Properties

    size = {}
    size.x = 10
    size.y = 20
    size.area () = self.x * self.y

Or as a hash:

    size = {
        x = 10
        y = 20
        area () = self.x * self.y
    }

## New Operator

    @new circle (40, 50, radius: 50)

Or

    new (circle (40, 50, radius: 50))

# Self

## Accessing Self

`self` is akin to `this` in JavaScript

    self.x

## Blocks Preserve Self

Self is always preserved in blocks:

    person = {
        name = 'Man Ray'
        say hi later () =
            set timeout
                console.log "my name is #(self.name)"
            1000
    }

## Self Blocks Redefine Self

use `=>` to allow self to be redefined by the caller of the block:

    web server =>
      self.get '/' =>
        self.response.end "hi!\n"

# Arrays

    colours = ['red', 'blue', 'yellow']

## Array Indexes

    fib = [0, 1, 1, 2, 3, 5]

    fib.0
    fib.5 = 5
    
    n = 3
    fib.(n) = 2

## List Comprehensions

Simple map:

    [x <- [1, 2, 3], x * x]

Filter:

    [x <- [1, 2, 3], x > 1, x]

Combinations:

    [x <- [1, 2, 3], y <- [4, 5, 6], [x, y]]

# Objects

    colour scheme = {bg 'red', fg 'yellow'}

Or

    colour scheme = {
        background = 'red'
        foreground = 'yellow'
    }

## Accessing Fields

    color scheme.background
    
    back or foreground = 'foreground'
    color scheme.(back or foreground)

# Control Structures

## If

    if (wind speed > 20)
        console.log "gone kitesurfing!"
    else
        console.log "no wind, programming"

## While

    finished = false

    while (@not finished)
        console.log "still going"

## Try Catch

    try
        something complicated ()
    catch (ex)
        console.log "it went horribly wrong"
    finally
        always do this ()


## For Each

    for each @(mountain) in (moutains)
        console.log (mountain)

## For

    for (n = 0, n < 10, ++n)
        console.log (n)

## For In

    for @(propertyName) in (someObject)
        console.log (propertyName)

## Return

    @return @new circle (40, 50, radius: 50)

Or

    return (new (circle (40, 50, radius: 50)))

## Throw

    @throw @new Error 'aaaaargghh!'

Or

    throw (new (Error 'aaaaargghh!'))

## Break

    break

## Continue

    continue

# Comments

    // this is a comment

    /* this
       is
       a
       comment */

# Strings

## Non-interpolating

    'Sophie''s World'

## Interpolating

    "hi #(persons name)"

## Special Characters

Only work in double-quoted strings:

    "tab: \t
     linefeed: \n
     carriage return: \r"

## Multi-line

Newlines are permitted, and indentation on subsequent lines is ignored:

    some html = "line one
                 line two
                 line three"

Or with single quotes:

    some html = 'line one
                 line two
                 line three'

# Regexps

Regexps use `r/.../` syntax, and accept the usual sufixes, `g`, `i` and `m`.

    r/.*\.jpg/i.test 'geographe.jpg'

# Nil

`nil` is the same as `undefined`, good for providing default values.

    this function does nothing () = nil

    render (title: nil) = ...

# Operators

## Instance of

You can check the type of something by using the `::` operator, all of these expressions are true:

    [] :: Array
    {} :: Object
    @{} :: Function
    "stuff" :: String
    9.8 :: Number
    false :: Boolean

## Boolean

    true @and true

    false @or true

    @not false

## Arithmetic

    a * b
    a / b
    a + b
    a - b

## Comparison

    a < b
    a <= b
    a >= b
    a > b

Strict equality, same as JavaScript `===`:

    a == b

Strict inequality, same as JavaScript `!==`:

    a != b

## Bitwise

Bitwise shift to greater significance:

    a << b      

Bitwise shift to lesser significance:

    a >> b    

Bitwise and

    a & b   

Bitwise or

    a | b  

## Increment/Decrement

    --a
    ++a

## Custom

Named operators are just function calls, so you can make your own:

    (region1) union (region2) = ...

    americas = north america @union south america

Likewise, you can write unary operators in the same way:

    inverse (region) = ...

    rest of the world = @inverse australia
