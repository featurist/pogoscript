---
layout: main
---

### New Syntax: [read about the changes here](/newsyntax.html)

# Whaa?

Pogoscript is a programming language that emphasises readability, is friendly to domain specific languages and compiles to regular Javascript.

# Examples!

The canonical [Node.js](http://nodejs.org/) hello world:

    http = require 'http'

    http.create server @(req, res)
        res.write head 200 ('Content-Type': 'text/plain')
        res.end "Hello World\n"
    .listen 1337 "127.0.0.1"

    console.log 'Server running at http://127.0.0.1:1337/'

The canonical [99 beers on the wall](http://99-bottles-of-beer.net/):

    sing (n) bottles of beer on the wall =
        if (n > 0)
            console.log ((n) bottles of beer on the wall)
            sing (n - 1) bottles of beer on the wall

    (n) bottles of beer on the wall =
        "#((n) bottles) of beer on the wall, #((n) bottles) of beer.\n" +
        "Take one down, pass it around, #((n - 1) bottles) of beer on the wall."

    (n) bottles =
        if (n == 0)
            "no bottles"
        else if (n == 1)
            "1 bottle"
        else
            "#(n) bottles"

    sing 99 bottles of beer on the wall

# The Big Features

## Names

Names of variables, functions and methods can contain spaces.

    wind speed = 25
    
    average temperature = 32

These get translated into their camel-case equivalents, so `average temperature` becomes `averageTemperature` in JavaScript.

## Arguments and Parameters

Arguments and parameters can be placed anywhere in the name of a function or method call. The careful placement of an argument or a parameter can give it a lot of meaning.

    mountains = ['Everest', 'La Tournette', 'Valuga']

    for each @(mountain) in (mountains)
        console.log (mountain)

## Blocks

Blocks are just indented code:

    after (duration, do something) =
        set timeout (do something, duration)
    
    (n) seconds =
        n * 1000
    
    after (10 seconds)
        console.log "hi there!"

## Async Calls

Make async operations behave as though they were synchronous with the `!` operator.

    fs = require 'fs'
    mojo = fs.read file! 'mojo.txt' 'utf-8'
    console.log (mojo)

Async calls also play nicely with `try catch finally`, `if else`, `for`, `while` and friends, and it even works in the REPL. Even though the async operator mimics synchronous behaviour, it is intended to facilitate truly asynchronous code, such as this simple [async `ls` implementation](https://gist.github.com/3770212), or more freakily: [continuations](https://github.com/featurist/pogoscript/blob/master/src/samples/continuations.pogo).

## Self

The `self` variable, also known as `this` in JavaScript, is retained from a block's outer context:

    jack = {
        name = "Jack"
        
        say hello () =
            console.log "hi, my name is #(self.name)"
            
            after (10 seconds)
                console.log "hi! this is #(self.name) again."
    }
    
    jack.say hello ()

But if you want and expect `self` to be redefined to something useful, put `=>` before the block like so:

    on each http request (action, port: 3000) =
        server = http.create server @(request, response)
            request context = {
                request = request
                response = response
            }
            
            action.call (request context)
            
        server.listen (port)
    
    on each http request =>
        self.response.end "Hello World\n"

## Optional Arguments

Methods and functions can take optional arguments, in the form of a hash passed as the last argument.

    web server (port: 4567) =
        console.log "starting web server on port #(port)"
    
    web server ()
    
    web server (port: 3000)

## No Built-in Keywords

There are no keywords in PogoScript. All control structures use the same syntax rules as regular functions and methods, so it's very easy to write your own control structures:

    unless (condition, block) =
        if (!condition)
            block ()
    
    unless (wind speed > 25)
        console.log "going surfing"

What about a multi-line control structure?

    render each in (list, render) if none (none) =
        if (list.length > 0)
            content = ''
            
            for each @(item) in (items)
                content = content + render (item)
            
            content
        else
            none ()

    mountains = ['Everest', 'La Tournette', 'Valuga']

    render each @(mountain) in (mountains)
        "<li>#(mountain)</li>"
    if none
        "<li>no mountains...</li>"

# Installation

Pogoscript requires [node.js](http://nodejs.org/) and [npm](http://npmjs.org/).

    npm install pogo

# Usage

## Interactive Prompt

    pogo

## Executing a Script

    pogo helloWorld.pogo

## Debugging a Script

All the regular `node` [debugging invocations](http://nodejs.org/api/debugger.html) work:

To invoke the node debugger:

	pogo debug helloWorld.pogo

To allow remote debugging, e.g. with [node-inspector](https://github.com/dannycoates/node-inspector):

	pogo --debug helloWorld.pogo

If you want to break on the first line:

	pogo --debug-brk helloWorld.pogo

You can also put breakpoints in your source code, just put `debugger` on its own line:

	some function ()
	debugger
	some other function ()

## Compiling a Script

    pogo -c helloWorld.pogo

Will produce `helloWorld.js`.

## Watching and Compiling

    pogo -cw *.pogo

# Credits

PogoScript was developed by Tim Macfarlane: [github.com/refractalize](http://github.com/refractalize), [@refractalize](http://twitter.com/refractalize), [blog.refractalize.org](http://blog.refractalize.org/).

Tim runs [Featurist](http://featurist.co.uk/) with [Josh Chisholm](http://github.com/joshski) and [Adrian Longley](http://github.com/adiel), a small software development consultancy based in London.
