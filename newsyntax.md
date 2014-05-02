---
layout: doc
---

# Syntax Changes

I've made some syntax changes to Pogoscript. My motivations being mainly to reduce the WTF-ness of the original syntax. Programming language syntax being mostly about usability, I think that its important to use familiar syntax for familiar language features unless we have a good reason not to.

So...

## Object Accessors

Instead of colon, (`:`), we now use dots (`.`). So this:

    object: field

becomes

    object.field

## No Omitted Self

Omitting `self` when accessing `self` fields or methods is no longer supported. So this:

    :field
    :method (arg)

Should be rewritten:

    self.field
    self.method (arg)

**Rationale**: [@joshski](https://github.com/joshski) pointed out that it's not uncommon to write javascript like the following:

    object
        .method(arg)
        .field;

If we allowed omitted self, the same code in Pogoscript would be very different, and possibly confusing.

## No Argument Calls and Definitions

Now there's only one way to call a function with no arguments: we use empty parenthesis, `()`. Pogoscript doesn't allow question mark (`?`) or exclamation mark (`!`). So this:

    do something!
    current state?

becomes

    do something ()
    current state ()

**Rationale**: This is an effort to be more concentric with regular programming languages, and to reduce the WTF-ness. I also plan to reuse the exclamation mark (`!`) to make asynchronous calls. The question mark (`?`) may be reborn as a so-called `andand` operator, allowing us to write `a.b.c`, and return `undefined` if any of `a` or `a.b` are `undefined` or `null`.

## Optional Arguments and Parameters

Instead of a semi-colon (`;`) delimited list for optional arguments and parameters, we put the optional arguments in parenthesis and delimit the name and value with a colon (`:`). So this:

    web server; port 80

becomes

    web server (port: 80)

The same is true for definitions, so this:

    web server; port 80 = ...

becomes

    web server (port: 80) = ...

Another slight difference is that there is no way to pass `true` as a default, as in this:

    open file 'something.txt'; readonly

So instead we have to be explicit as pass `true`:

    open file ('something.txt', readonly: true)

And likewise, we cannot declare optional parameters as undefined by default, as in:

    http request (url); body = ...

Instead we write can use `nil` or `undefined`:

    http request (url, body: nil) = ...

**Rationale**: [@adiel](https://github.com/adiel) found the semi-colon (`;`) syntax confusing at first glance, and if he finds it confusing just about anybody else would. The new syntax is more inline with other programming languages (Ruby 1.9, C# 4.0, CoffeeScript, and to some extent Smalltalk and Objective-C.)
