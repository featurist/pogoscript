---
layout: doc
title: Cheat Sheet
---

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

## Block Arguments

    set timeout
        console.log "hi!"
    1000

Or all on one line:

    set timeout @{console.log "hi!"} 1000

## Block Parameters

    map each @(name) in (names) into
        "<div class='name'>#(name)</div>"

## Async Functions

Use the `!` operator:

    users.find by name! 'Jack'

## Async Blocks

Blocks that contain async calls expect an async callback as the last argument, works great in [mocha](http://visionmedia.github.com/mocha) tests:

    describe 'finding users'
        it 'finds users by name'
            users.find by name! 'Jack'
            ...

If you pass two blocks and one of them is async, the other is made async too:

    run (block1) then (block2) =
        block1!()
        block2!()

    user = nil
    run!
        user = users.find by name! 'Jack'
    then
        console.log (user.name)

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

    [x * x, where: x <- [1, 2, 3]]

Filter:

    [x, where: x <- [1, 2, 3], x > 1]

Combinations:

    [x * y, where: x <- [1, 2, 3], y <- [4, 5, 6]]

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

    for (n = 0, n < 10, n = n + 1)
        console.log (n)

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
