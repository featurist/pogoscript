---
layout: post
title: Continuations
---

Pogoscript 0.3 introduced the `continuation` macro, which allows you to access the continuation or "callback" in an asynchronous function. Here's an illustration:

    add! (a, b) = a + b

Is the same as:

    add (a, b, callback) = callback (nil, a + b)

Which, with the `continuation` macro, is the same as:

    add! (a, b) = continuation (nil, a + b)

The `continuation` is defined on any asynchronous function, i.e. those functions declared with a `!`, or those already calling another function with the `!` operator. When you call it, you're returning from the async function, it's a bit like the `return` macro, but for async functions.

The primary motivation for `continuation` was to support integration with existing libraries that use callbacks, but do them in such a way as to be incompatible with pogoscript's async support.

Ordinarily, for example, to integrate with jQuery's `$.get`, we would write something like this:

    getAccountDetailsFor (user, callback) =
        $.get "/accounts/#(user)".done @(details)
            callback (nil, details)
        .fail @(error)
            callback (error)

And then you could call it like this:

    jeffsDetails = getAccountDetailsFor! "jeff"
    doStuffWith (jeffsDetails)

Which works fine, except, if we wanted to insert another asynchronous call into `get account details for`, then we're back to writing mental callback spaghetti:

    getAccountDetailsFor (user, callback) =
        getRoutes @(error, routes)
            $.get (routes.account (user)).done @(details)
                callback (nil, details)
            .fail @(error)
                callback (error)
    
Where perhaps `get routes (callback)` hits the server on first load, but cached results from then on. Either way it should be called asynchronously, and why not?

Problem is we've been lazy and forgotten to put any error checking into our call to `get routes`, whereas really we should have used the async operator `!` which will take care of all that for us, no fuss. We want to mix the two styles: pogo async and regular callbacks. So we remove the `callback` parameter, make our function async with `!` and use the `continuation` macro:

    getAccountDetailsFor! (user) =
        routes = getRoutes! ()
        
        $.get (routes.account (user)).done @(details)
            continuation (nil, details)
        .fail @(error)
            continuation (error)

The continuation macro uses the Node.js calling convention: `continuation (error, result)`. So for successful results, write this: `continuation (nil, 'my result')`. For a failure, resulting in an error to be raised back to the caller: `continuation ('an error')`.

There are some other things you can do with `continuation`, like for example, return more than once, or to remember the continuation for calling later.

This program calls the `continuation` repeatedly forever. The code below the call to `deja vu!` will be executed ad infinitum:

    dejaVu()! =
        while (true)
            continuation ()
    
    dejaVu()!
    
    console.log 'are we there yet?'

Resulting in:

    are we there yet?
    are we there yet?
    are we there yet?
    ...

Not a very useful program.

The following program illustrates a simple search and rewind pattern which forms the basis of Prolog's execution strategy. The idea is that you search for the correct result, but if you fail, just rewind and try again:

    startSearch! =
        tryAgain () =
            continuation (nil, tryAgain)

        tryAgain ()

    findANumberGreaterThan! (n) =
        i = 0
        tryAgain = startSearch!
        
        console.log "trying #(i)"
        if (i > n)
            continuation (nil, i)
        else
            ++i
            tryAgain ()

    console.log "yay, found #(find a number greater than! 3)"

Resulting in:

    trying 0
    trying 1
    trying 2
    trying 3
    trying 4
    yay, found 4

This may seem a little contrived since you could easily do this in a loop, or better, just add `1` to `n` in this case. But this strategy can work for more complicated searches covering a larger combinatorial solution space, where you make different choices on each run.

There are a few things to remember when using `continuation` though. Functions that use `continuation` don't return by default, unlike normal async functions. Any reference to `continuation` in an async function will tell the compiler that any return is explicit, even if you don't actually call `continuation`. Here's an example:

This function returns normally:

    add! (a, b) =
        a + b

This one won't ever return, it assumes that because you're handling `continuation` that you'll call it explicitly:

    add! (a, b) =
        console.log (continuation)
        a + b

Hope it helps, go get it: `npm install pogo`
