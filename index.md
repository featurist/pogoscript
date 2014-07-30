---
layout: main
---

# Whaa?

Pogoscript is a programming language that has amazing concurrency primitives, emphasises readability and compiles to regular Javascript.

# Examples!

Concurrently resize all images in a directory

    im = require 'imagemagick'
    fs = require 'fs'
    path = require 'path'

    resizeImagesInDirectory (dir, width = nil, height = nil) = [
      file <- fs.readdir (dir) ^!
      ext = path.extname(file)
      destFile = "#(path.basename(file, ext))-small#(ext)"
      im.resize {
         srcPath = "#(dir)/#(file)"
         dstPath = "#(dir)/#(destFile)"
         width = width
         height = height
      } ^!
    ]

    resizeImagesInDirectory 'images' (width = 128)!

Concurrently download a podcast

    httpism = require 'httpism'
    cheerio = require 'cheerio'
    fs = require 'fs'
    path = require 'path'

    downloadPodcast(url) =
      rss = httpism.get(url)!.body
      $ = cheerio.load(rss)

      [
        enclosure <- $'enclosure'
        url = $(enclosure).attr 'url'
        filename = "music/#(path.basename(url))"

        if (@not file (filename) exists!)
          httpism.get(url)!.body.pipe(fs.createWriteStream(filename))
      ]

    file (fn) exists =
      promise @(result)
        fs.exists(result)

    downloadPodcast 'http://radiofrance-podcast.net/podcast09/rss_13015.xml'!

The canonical [Node.js](http://nodejs.org/) hello world:

    http = require 'http'

    http.createServer @(req, res)
      res.writeHead (200, 'Content-Type' = 'text/plain')
      res.end "Hello World\n"
    .listen (1337, "127.0.0.1")

    console.log 'Server running at http://127.0.0.1:1337/'

The canonical [99 beers on the wall](http://99-bottles-of-beer.net/):

    sing (n) bottlesOfBeerOnTheWall =
      if (n > 0)
        console.log ((n) bottlesOfBeerOnTheWall)
        sing (n - 1) bottlesOfBeerOnTheWall

    (n) bottlesOfBeerOnTheWall =
      "#((n) bottles) of beer on the wall, #((n) bottles) of beer.\n" +
      "Take one down, pass it around, #((n - 1) bottles) of beer on the wall."

    (n) bottles =
      if (n == 0)
        "no bottles"
      else if (n == 1)
        "1 bottle"
      else
        "#(n) bottles"

    sing 99 bottlesOfBeerOnTheWall

# The Big Features

## Async Calls

Make async operations behave as though they were synchronous with the `!` operator.

    fs = require 'fs'
    mojo = fs.readFile 'mojo.txt' 'utf-8' ^!
    console.log (mojo)

Async calls also play nicely with `try catch finally`, `if else`, `for`, `while`, and it even works in the REPL. Even though the async operator mimics synchronous behaviour, it is intended to facilitate truly asynchronous and concurrent applications.

## List Comprehensions

A short-hand for map/select:

    [x <- [1, 2, 3], y <- [1, 2, 3], x < y, [x, y]]

Asynchronous calls are executed concurrently:

    documents = [id <- docIds, http.get "/documents/#(id)"!]

## Arguments and Parameters

Arguments and parameters can be placed anywhere in the name of a function or method call. The careful placement of an argument or a parameter can give it a lot of meaning.

    mountains = ['Everest', 'La Tournette', 'Valuga']

    for each @(mountain) in (mountains)
      console.log (mountain)

## Blocks

Blocks are just indented code:

    after (duration, doSomething) =
      setTimeout (doSomething, duration)

    (n)s =
      n * 1000

    after (10s)
      console.log "hi there!"

## Self

The `self` variable, also known as `this` in JavaScript, is retained from a block's outer context:

    jack = {
      name = "Jack"

      sayHello () =
        console.log "hi, my name is #(self.name)"

        after (10s)
          console.log "hi! this is #(self.name) again."
    }

    jack.sayHello ()

Self just works like it should: in methods it is the method's object, in functions it is the nearest enclosing method's object (if there is one.)

## Optional Arguments

Methods and functions can take optional arguments, in the form of a hash passed as the last argument.

    webServer (port = 4567) =
      console.log "starting web server on port #(port)"

    webServer ()

    webServer (port = 3000)

## No Built-in Keywords

There are no keywords in Pogoscript. All control structures use the same syntax rules as regular functions and methods, so it's very easy to write your own control structures:

    unless (condition, block) =
      if (!condition)
        block ()

    unless (windSpeed > 25)
      console.log "going surfing"

What about a multi-line control structure?

    renderEachIn (list, render) ifNone (none) =
      if (list.length > 0)
        content = ''

        for each @(item) in (items)
          content := content + render (item)

        content
      else
        none ()

    mountains = ['Everest', 'La Tournette', 'Valuga']

    renderEach @(mountain) in (mountains)
      "<li>#(mountain)</li>"
    ifNone
      "<li>no mountains...</li>"

# Installation

Pogoscript requires [node.js](http://nodejs.org/) and [npm](http://npmjs.org/).

    npm install -g pogo

Or to install local to your project:

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

    someFunction ()
    debugger
    someOtherFunction ()

## Compiling a Script

    pogo -c helloWorld.pogo

Will produce `helloWorld.js`.

## Watching and Compiling

    pogo -cw *.pogo

# Tools

* [grunt-pogo](https://github.com/leecrossley/grunt-pogo) by [Lee Crossley](https://github.com/leecrossley) for compiling your pogoscripts with **Grunt**.

* [gulp-pogo](https://github.com/dereke/gulp-pogo) by [Derek Ekins](https://github.com/dereke) for compiling your pogoscripts with **Gulp**.

* [pogoify](https://github.com/featurist/pogoify) by [Josh Chisholm](https://github.com/joshski), a plugin for **Browserify** that compiles your pogoscript files into browserify bundles.

# Articles

* [Compiling Pogo](http://dereke.github.io/compiling-pogo/) by [Derek Ekins](https://github.com/dereke).

* [Testing your pogo with mocha](http://dereke.github.io/testing-your-pogo-with-mocha/) by [Derek Ekins](https://github.com/dereke).

* [Multiline text and string interpolation](http://dereke.github.io/multiline-text-and-string-interpolation/) by [Derek Ekins](https://github.com/dereke).

# Credits

Pogoscript was developed by Tim Macfarlane: [github.com/refractalize](http://github.com/refractalize), [@refractalize](http://twitter.com/refractalize), [blog.refractalize.org](http://blog.refractalize.org/).

Tim runs [Featurist](http://featurist.co.uk/) with [Josh Chisholm](http://github.com/joshski) and [Adrian Longley](http://github.com/adiel), a small software development consultancy based in London.
