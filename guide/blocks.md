---
layout: doc
title: Guide
guide: Blocks
weight: 3
---

Blocks are arguments to functions that are also functions themselves. In effect, blocks allow you to pass some custom behaviour to a function, for example, to run a bit of code if an event occurs or to answer some question required during the function's execution. This is a classic functional programming design pattern, and a function that takes an other function as an argument is often called a higher-order function.

In pogoscript, blocks come in two syntactical forms, the indented version looks like this:

    loop 2 times
        console.log 'hi' 

This, as you can imagine, prints `hi` twice.

The other form looks like this:

    loop 2 times @{ console.log 'hi' }

In fact, anywhere you see an indented section of code, you can rewrite it using the `@{ ... }` form, and visa-versa.

## Higher-Order Functions

Don't worry, higher-order functions aren't special. All they do is call one or more of their arguments as functions. So, for example, to define the `loop times` function we used above, we could write this:

    loop (times) times (block) =
        for (n = 1, n <= times, ++n)
            block ()

It just calls `block` inside the `for` loop.

## Blocks that have parameters

Blocks can also define parameters, that is, as functions they can be called with arguments and so they can receive those arguments too. To define block parameters we use the `@(param)` syntax. Say, we want to print the number of the loop in our `loop times` function, starting with 1.

    loop 2 times @(n)
        console.log "#(n): hi"

Of course, we'd have to change our definition of `loop times` to pass the loop number to `block`:

    loop (times) times (block) =
        for (n = 1, n <= times, ++n)
            block (n)

Multiple parameters are also allowed and they can be separate, as in `@(a) @(b)`, or together separated by commas, as in `@(a, b)`. So, lets imagine we have a list of items that we want to loop through, one for each item, but we want the index too:

    primes = [1, 2, 3, 5, 7, 11, 13]
    for each item @(prime) and index @(index) in (primes)
        console.log "Prime number #(index + 1) is #(prime)"

We can define `for each item and index in` like this:

    for each item and index in (list, block) =
        for (index = 0, index < list.length, ++index)
            block (list.(index), index)

## Passing multiple blocks

Several blocks can be passed to a function. This doesn't often happen but can be used to describe some complex behaviour. Lets imagine that you wanted to loop n times, but if it didn't loop (e.g. if n was zero) then you wanted to do something else.

    loop (n) times
        console.log 'hi'
    otherwise
        console.log 'is anyone here?'

This is equivalent to and could also be written like this:

    loop (n) times @{ console.log 'hi' } otherwise @{ console.log 'is anyone here?' }

Or any combination thereof. But there's a trick here, if you write it like this, with an empty line before the `otherwise`:

    loop (n) times
        console.log 'hi'

    otherwise
        console.log 'is anyone here?'

Then it is interpreted as being two separate calls, one to `loop times` and the other to a (perhaps non-existent) function called `otherwise`. People bump into this when they first start writing pogoscript but they quickly get over it. The thing to remember is that the line immediately after a block is taken as the continuation of the line that started the block.

## Chaining calls with blocks

Now that we know about the line immediately after a block, we can use that to chain calls with blocks. The common scenario is a map/filter, where we map some values from one list into another, then apply a filter:

    map each @(contact) in (address book) to
        contact.first name
    .select each @(first name) where
        first name.match r/^a/i

Which is the same as this:

    map each @(contact) in (address book) to @{ contact.first name }.select each @(first name) where
        first name.match r/^a/i

As a side note, the above can be written using list comprehensions like this:

    [first name, where: contact <- address book, first name = contact.first name, first name.match r/^a/i]

Or this might be better:

    [
        first name
        where: contact <- address book
        first name = contact.first name
        first name.match r/^a/i
    ]

## After the block

In general, the line after the block is part of the same function call, so you can pass additional arguments:

    set timeout
        console.log "a belated greeting"
    1000

Or, as a variable:

    n = 1000

    set timeout
        console.log "a belated greeting"
    (n)

Or you can continue describing the name of the function:

    set
        console.log "a belated greeting"
    timeout 1000

Or you can start with the block:

    @{
        console.log "a belated greeting"
    } set timeout 1000

(both awkward ways to call `setTimeout` but still valid.)
