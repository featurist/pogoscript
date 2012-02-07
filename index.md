---
layout: main
---

## What is it?

Pogoscript is a programming language that emphasises readability, is friendly to domain specific languages and compiles to regular Javascript.

## Ok, what does it look like?

    sing @n bottles of beer on the wall =
        if (n > 0)
            console: log (@n bottles of beer on the wall)
            sing (n - 1) bottles of beer on the wall

    @n bottles of beer on the wall =
        "@(@n bottles) of beer on the wall, @(@n bottles) of beer on the wall
         take one down, pass it around, @((n - 1) bottles) of beer on the wall."

    @n bottles =
        if (n == 0)
            "no bottles"
        else if (n == 1)
            "1 bottle"
        else
            "@n bottles"

    sing 99 bottles of beer on the wall

Great if you write programs that generate beer song lyrics, but you'll be surprised to learn that it's useful for other kinds of software too.

## In Broad Strokes

As you can see, arguments can be placed before, after or even _in_ the name of the function or method. This gives the argument a valuable context to express its meaning. The same is also true for parameters. Lambdas, or blocks, or functions, are indented sections of code.

Consider the following fragment:

    for each #author in @authors
        console: log @author

We're looking at a function called `for each in`. It takes two arguments: a list (of authors in this case) and a function that takes one argument (`author`, shown prefixed with `#`). The body of the function is indented, printing out the author. You may have noticed that this is not a built-in statement, it's just a function - the likes of which you're easily able to make yourself.

The idea is that programmers write code for themselves and others to read. Machine code is for computers.

## Is that all?

This is a pretty gentle introduction to the motivating philosophy of PogoScript. There's loads more to explore, including a sane syntax for asynchronous function calls (especially useful in [Node](http://nodejs.org/) apps), a hygenic macro system and loads of other useful tidbits. [Stay tuned](https://github.com/featurist/pogoscriptd).


