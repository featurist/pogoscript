---
layout: cheetsheet
---

# Variables

Variables can contain spaces, numbers, `$` and `_`.

## Defining

    small number = 8

Or

    small number =
        8

## Identifier Conjugation

`small number` is the same as `smallNumber`
    
# Calling Functions

    move file "logbook.txt" to dir "~/docs"
    
## Variable Arguments

    filename = "logbook.txt"
    docs dir = "~/docs"
    move file @filename to dir (docs dir)

## Without arguments

    current time?

or

    refresh account info!

## With Optional Arguments

    web server, port 80

## With Splat Arguments

    sum @numbers ...

## Block Arguments

    set timeout
        console: log "hi!"
    1000

Or

    set timeout @{console: log "hi!"} 1000

## Block Parameters

    map each #name in @names into
        "<div class='name'>@name</div>"

# Defining Functions

    move file @filename to dir (dir name) = ...

## Without Arguments

    current time? = new @Date

or
    
    refresh account info! = ...

## With Optional Parameters

    web server, port = ...

Or, with an default value

    web server, port 80 = ...

## With Splat Parameters

    sum @numbers ... =
        ...

# Objects

## Calling Methods

    date = new (Date 2011 4 5)
    month = date: get month?
    date: set minutes 5

## Defining Methods and Properties

    size = {}
    size: x = 10
    size: y = 20
    size: area? = self: x * self: y

Or

    size = {
        x = 10
        y = 20
        area? = self: x * self: y
    }

## Accessing Self

`self` is akin to `this` in JavaScript

    self: x

Or

    :x

## Blocks Preserve Self

    html = {
        span @contents, class =
            "<p @class>@(contents?)</p>"
    }

    person = {
        name = 'Harry'
        html? =
            html: span, class 'name'
                :name
    }

## Self Blocks Redefine Self

    books = [{
        title 'Wind in the Willows'
        author 'Kenneth Graham'
    }]
    
    resource @path @methods =
        method context = {
            get @content =
                ... content @id ...
                
            list @items =
                ... items? ...
        }
        
        methods: call (method context)

    resource '/books' =>
        :get #id
            books: @id
        
        :list
            books

## Array Indexes

    fib = [0. 1. 1. 2. 3. 5]

    fib: 0
    fib: 5 = 5

# Arrays

    colours = ['red'. 'blue'. 'yellow']

# Hashes

    colour scheme = {bg 'red'. fg 'yellow'}
    
Or

    colour scheme = {
        background = 'red'
        foreground = 'yellow'
    }

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

    "hi @name"

Or

    "hi @(persons name)"

## Special Characters

    "tab: \t
     linefeed: \n
     carriage return: \r"

## Multi-line

Indent to after the quote `"`:

    some html = "<html>
                   <body>...</body>
                 </html>"

Or

    some html = "<html>
                   <body>...</body>
                 </html>"

# Regexps

    `.*\.jpg`gim

