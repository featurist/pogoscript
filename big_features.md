---
layout: doc
---

# Whaa?

PogoScript is a readable dialect of JavaScript.

Well, that's the idea anyway. It's also a bit of an experiment in making a DSL friendly programming language, ala Ruby, but faster, stronger, better.

# Examples

The canonical Node.js hello world:

    http = require 'http'

    http: create server #req #res
        res: write head 200, 'Content-Type' 'text/plain'
        res: end "Hello World\n"
    : listen 1337 "127.0.0.1"

    console: log 'Server running at http://127.0.0.1:1337/'

The canonical 99 beers on the wall:

    sing @n bottles of beer on the wall =
        if (n > 0)
            console : log (@n bottles of beer on the wall)
            sing (n - 1) bottles of beer on the wall

    @n bottles of beer on the wall =
        "@(@n bottles) of beer on the wall, @(@n bottles) of beer on the wall\n" +
        "take one down, pass it around, @((n - 1) bottles) of beer on the wall."

    @n bottles =
        if (n == 0)
            "no bottles"
        else if (n == 1)
            "1 bottle"
        else
            "@n bottles"

    sing 99 bottles of beer on the wall

# The Big Features

<br/>

## Names

Names of variables, functions and methods can contain spaces.

    wind speed = 25
    
    average temperature = 32

## Arguments and Parameters

Arguments and parameters can be placed anywhere in the name of a function or method call. The careful placement of an argument or a parameter can give it a lot of meaning. If an argument is a single word variable, it can just be prefixed with `@`. A parameter is always prefixed with a `#`.

    mountains = ['Everest', 'La Tournette', 'Valuga']

    for each #mountain in @mountains
        console: log @mountain

## Blocks

Blocks are just indented code:

    after @duration (do something) =
        set timeout (do something) @duration
    
    @n seconds =
        n * 1000
    
    after (10 seconds)
        console: log "hi there!"

## Self

The `self` variable, also known as `this` in JavaScript, is retained from a block's outer context:

    jack = {
        name = "Jack"
        
        say hello! =
            console: log "hi, my name is @(self: name)"
            
            after (10 seconds)
                console: log "hi! this is @(self: name) again."
    }
    
    jack: say hello!

But if you want and expect `self` to be redefined to something useful, put `=>` before the block like so:

    on each http request @action, port 3000 =
        server = http: create server #request #response
            request context = {
                request = request
                response = response
            }
            
            action: call (request context)
            
        server: listen @port
    
    on each http request =>
        self: response: end "Hello World\n"

In fact, there's a shorthand for `self:`, it's just `:`. So we could rewrite the above to:

    on each http request =>
        :response: end "Hello World\n"

## Optional Arguments

Methods and functions can take optional arguments, in the form of a hash passed as the last argument.

    web server, port 4567 =
        console: log "starting web server on port @port"
    
    web server!
    
    web server, port 3000

## No Built-in Keywords

There are no keywords in PogoScript. All control structures use the same syntax rules as regular functions and methods, so it's very easy to write your own control structures:

    unless @condition @block =
        if (!condition)
            block!
    
    unless (wind speed > 25)
        console: log "going surfing"

What about a multi-line control structure?

    render each in @list @render if none @none =
        if (list: length > 0)
            content = ''
            
            for each #item in @items
                content = content + render @item
            
            content
        else
            none?

    mountains = ['Everest', 'La Tournette', 'Valuga']

    render each #mountain in @mountains
        "<li>@mountain</li>"
    if none
        "<li>no mountains...</li>"
