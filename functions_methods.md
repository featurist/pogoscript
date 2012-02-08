---
layout: doc
---

# Variables

Variables can have spaces in them:

    wind strength = 25

# Functions

Functions can have spaces in them. Arguments are specified in brackets and can be placed anywhere:

    (wind strength) in km per hour

If a variable is a single word, then it can be passed with a leading `@` symbol:

    name = "Jackson"
    print @name

## Closures

Functions can be called by passing a closure, the body of which is indented after the function.

    print "now!"
    
    after (4 seconds)
        print "4 seconds later..."

A closure can have parameters too, which are specified using the `#` symbol:

    for each #number in [1, 2, 3]
        print @number

The parameters to a closure can be anywhere _before_ the closure, even before other arguments.

## Multi-line Functions

A function that takes a closure can span several lines:

    list = []
    
    for each #number in @list
        print @number
    if none
        print "no numbers"

This function is called `for each in if none`. It spans the four lines, including the two closures. However It's important that the `if none` is specified immediately after the first closure, no empty lines should separate them. Otherwise, you'll be invoking two functions `for each in` and `if none`:

    for each #number in @list
        print @number
        
    if none
        print "no numbers"

