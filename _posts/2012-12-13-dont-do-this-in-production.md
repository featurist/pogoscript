---
layout: post
title: Don't Do This In Production!
---

This is a list of things you should not do in production code.

What each of these things has in common is excessive use of Pogoscript's async operator. Let's get started:

## Continuations

At the heart of Pogoscript's async operator is the notion of a continuation. A continuation is perhaps best explained with the use of debugging metaphor: you're debugging a program and you've stopped at a breakpoint. The continuation is the remainder of the program that would be executed if you pressed the go button. In Pogoscript, the continuation is a function that is passed to an asynchronous method or function. This method or function can call this function, or not, or as many times as it likes. For example:

    repeat twice (continuation) =
        continuation ()
        continuation ()
    
    repeat twice!
    
    console.log 'hi'

The output of this program is:

    hi
    hi

Nice and weird. But not that weird if you know how the `!` operator works. We have a function called `repeat twice`, which takes a `callback` argument. This argument is the rest of the program when you call it, i.e. the `console.log 'hi'`

You could say this is a control structure because it affects the program flow, and this is what continuations allow you to do - re-define program flow.

## FRP

FRP is Functional Reactive Programming, which is...

I'll explain.

FRP is, simply speaking, a way to build event processors. The idea is that you have an event source that produces events, and you build up a pipeline that can process those events. Pipeline elements may filter events, transform events, merge events or even produce more events of their own. Perhaps we could benefit from using a concrete example. Let's say you have a thermometer that produces readings of the day's temperature every minute or so.

    thermometer reading (continuation) =
        hour = 0
        day = 0

        current temperature () =
            ++hour
            if (hour >= 24)
                hour := 0
                ++day
        
        
            Math.sin(Math.PI * hour / 12) * 2.5 + 0.5 * day

        set interval
            continuation (nil, current temperature ())
        0

    last readings = []
    (n) hour average of (temp, continuation) =
        last readings.push (temp)
    
        if (last readings.length >= n)
            total = last readings.reduce @(l, r)
                l + r

            last readings.splice (0, last readings.length)
            continuation (nil, total / n)
        
    temp = thermometer reading!
    avg = 3 hour average of (temp)!
    console.log ("average temp", avg)

## Cooperative Threads
## Actors
## Coroutines
## Choice
## Prolog
